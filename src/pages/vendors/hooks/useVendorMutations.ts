import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

type VendorPayload = {
  name: string
  email: string | null
  phone: string | null
  address: string | null
  category_id: string | null
  notes: string | null
}

async function fetchUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id!
}

export function useCreateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: VendorPayload) => {
      const userId = await fetchUserId()
      const { error } = await supabase.from('vendors').insert({ ...payload, user_id: userId })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] })
      toast.success('Vendor created')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: VendorPayload & { id: string }) => {
      const { error } = await supabase.from('vendors').update(payload).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] })
      toast.success('Vendor updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vendors').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] })
      toast.success('Vendor deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
