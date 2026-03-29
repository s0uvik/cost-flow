import { useQuery } from '@tanstack/react-query'
import {
  startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter,
  startOfYear, endOfYear,
  format,
} from 'date-fns'
import { supabase } from '@/lib/supabase'

export type BudgetRow = {
  id: string
  name: string
  amount_limit: number
  period: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string | null
  category_id: string | null
  categories: { name: string; color: string } | null
  spent: number
  percentage: number
}

async function fetchUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

function getPeriodRange(period: 'monthly' | 'quarterly' | 'yearly') {
  const now = new Date()
  switch (period) {
    case 'monthly':
      return { from: format(startOfMonth(now), 'yyyy-MM-dd'), to: format(endOfMonth(now), 'yyyy-MM-dd') }
    case 'quarterly':
      return { from: format(startOfQuarter(now), 'yyyy-MM-dd'), to: format(endOfQuarter(now), 'yyyy-MM-dd') }
    case 'yearly':
      return { from: format(startOfYear(now), 'yyyy-MM-dd'), to: format(endOfYear(now), 'yyyy-MM-dd') }
  }
}

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets', 'list'],
    queryFn: async () => {
      const userId = await fetchUserId()
      if (!userId) return []

      const { data: budgets } = await supabase
        .from('budgets')
        .select('id, name, amount_limit, period, start_date, end_date, category_id, categories(name, color)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!budgets?.length) return []

      // Fetch all current-period transactions once per period type
      const periodRanges = {
        monthly: getPeriodRange('monthly'),
        quarterly: getPeriodRange('quarterly'),
        yearly: getPeriodRange('yearly'),
      }

      const { data: txns } = await supabase
        .from('transactions')
        .select('amount, category_id, date')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', periodRanges.yearly.from)
        .lte('date', periodRanges.yearly.to)

      const allTxns = txns ?? []

      return budgets.map(b => {
        const range = getPeriodRange(b.period)
        const spent = allTxns
          .filter(t =>
            t.category_id === b.category_id &&
            t.date >= range.from &&
            t.date <= range.to
          )
          .reduce((s, t) => s + t.amount, 0)

        return {
          ...b,
          categories: b.categories as { name: string; color: string } | null,
          spent,
          percentage: b.amount_limit > 0 ? Math.min((spent / b.amount_limit) * 100, 100) : 0,
        } as BudgetRow
      })
    },
  })
}
