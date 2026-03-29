import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

type ClientPayload = {
  name: string
  email: string | null
  phone: string | null
  company: string | null
  address: string | null
  notes: string | null
}

async function fetchUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id!
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ClientPayload) => {
      const userId = await fetchUserId()
      const { error } = await supabase.from('clients').insert({ ...payload, user_id: userId })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client created')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: ClientPayload & { id: string }) => {
      const { error } = await supabase.from('clients').update(payload).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
