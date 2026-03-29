import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

type BudgetPayload = {
  name: string
  amount_limit: number
  period: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string | null
  category_id: string | null
}

async function fetchUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id!
}

export function useCreateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: BudgetPayload) => {
      const userId = await fetchUserId()
      const { error } = await supabase.from('budgets').insert({ ...payload, user_id: userId })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Budget created')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: BudgetPayload & { id: string }) => {
      const { error } = await supabase.from('budgets').update(payload).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Budget updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Budget deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
