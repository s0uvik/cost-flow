import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCategories() {
  return useQuery({
    queryKey: ['categories', 'expense'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('categories')
        .select('id, name, color')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('name')
      return data ?? []
    },
    staleTime: 5 * 60 * 1000,
  })
}
