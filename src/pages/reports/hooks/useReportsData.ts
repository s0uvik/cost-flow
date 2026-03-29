import { useQuery } from '@tanstack/react-query'
import {
  startOfMonth, endOfMonth, startOfQuarter, endOfQuarter,
  startOfYear, endOfYear, subMonths, format, eachMonthOfInterval,
} from 'date-fns'
import { supabase } from '@/lib/supabase'

export type DatePreset = 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'last_year' | 'custom'

export function getPresetRange(preset: DatePreset, customFrom?: string, customTo?: string) {
  const now = new Date()
  switch (preset) {
    case 'this_month':   return { from: startOfMonth(now), to: endOfMonth(now) }
    case 'last_month':   return { from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) }
    case 'this_quarter': return { from: startOfQuarter(now), to: endOfQuarter(now) }
    case 'last_quarter': return { from: startOfQuarter(subMonths(now, 3)), to: endOfQuarter(subMonths(now, 3)) }
    case 'this_year':    return { from: startOfYear(now), to: endOfYear(now) }
    case 'last_year':    return { from: startOfYear(new Date(now.getFullYear() - 1, 0)), to: endOfYear(new Date(now.getFullYear() - 1, 0)) }
    case 'custom':
      return {
        from: customFrom ? new Date(customFrom) : startOfMonth(now),
        to: customTo ? new Date(customTo) : endOfMonth(now),
      }
  }
}

async function fetchUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

export function useReportsData(preset: DatePreset, customFrom?: string, customTo?: string) {
  return useQuery({
    queryKey: ['reports', preset, customFrom, customTo],
    queryFn: async () => {
      const userId = await fetchUserId()
      if (!userId) return null

      const range = getPresetRange(preset, customFrom, customTo)
      const fromStr = format(range.from, 'yyyy-MM-dd')
      const toStr   = format(range.to,   'yyyy-MM-dd')

      const [txRes, invRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('id, type, amount, description, date, category_id, vendor_id, client_id, categories(name, color), vendors(name), clients(name)')
          .eq('user_id', userId)
          .gte('date', fromStr)
          .lte('date', toStr)
          .order('date', { ascending: true }),
        supabase
          .from('invoices')
          .select('total, status, client_id, clients(name)')
          .eq('user_id', userId)
          .gte('issue_date', fromStr)
          .lte('issue_date', toStr),
      ])

      const txns    = txRes.data ?? []
      const invoices = invRes.data ?? []

      const income   = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

      // Monthly trend within range
      const months = eachMonthOfInterval({ start: range.from, end: range.to })
      const monthlyTrend = months.map(m => {
        const key = format(m, 'yyyy-MM')
        const monthTxns = txns.filter(t => t.date.startsWith(key))
        return {
          month:    format(m, 'MMM yy'),
          income:   monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          expenses: monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        }
      })

      // Category breakdown
      const expByCategory: Record<string, { name: string; color: string; amount: number; count: number }> = {}
      const incByCategory: Record<string, { name: string; color: string; amount: number; count: number }> = {}

      for (const t of txns) {
        const cat = t.categories as { name: string; color: string } | null
        const key = cat?.name ?? 'Uncategorised'
        const color = cat?.color ?? '#94a3b8'
        const map = t.type === 'expense' ? expByCategory : incByCategory
        if (!map[key]) map[key] = { name: key, color, amount: 0, count: 0 }
        map[key].amount += t.amount
        map[key].count++
      }

      const expenseCategories = Object.values(expByCategory).sort((a, b) => b.amount - a.amount)
      const incomeCategories  = Object.values(incByCategory).sort((a, b) => b.amount - a.amount)

      // Top vendors
      const vendorMap: Record<string, { name: string; amount: number; count: number }> = {}
      for (const t of txns.filter(t => t.type === 'expense')) {
        const v = t.vendors as { name: string } | null
        if (!v) continue
        if (!vendorMap[v.name]) vendorMap[v.name] = { name: v.name, amount: 0, count: 0 }
        vendorMap[v.name].amount += t.amount
        vendorMap[v.name].count++
      }
      const topVendors = Object.values(vendorMap).sort((a, b) => b.amount - a.amount).slice(0, 5)

      // Top clients (from invoices)
      const clientMap: Record<string, { name: string; amount: number; count: number }> = {}
      for (const inv of invoices.filter(i => i.status !== 'cancelled')) {
        const c = inv.clients as { name: string } | null
        if (!c) continue
        if (!clientMap[c.name]) clientMap[c.name] = { name: c.name, amount: 0, count: 0 }
        clientMap[c.name].amount += inv.total
        clientMap[c.name].count++
      }
      const topClients = Object.values(clientMap).sort((a, b) => b.amount - a.amount).slice(0, 5)

      return {
        range: { from: fromStr, to: toStr },
        summary: { income, expenses, net: income - expenses, txCount: txns.length },
        monthlyTrend,
        expenseCategories,
        incomeCategories,
        topVendors,
        topClients,
        rawTransactions: txns,
      }
    },
  })
}
