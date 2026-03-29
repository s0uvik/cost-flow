import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type VendorRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  category_id: string | null;
  notes: string | null;
  created_at: string;
  categories: { name: string; color: string } | null;
  transaction_count: number;
  total_spent: number;
};

async function fetchUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

type Filters = { q: string; categoryId: string; page: number };
const PAGE_SIZE = 12;

export function useVendors(filters: Filters) {
  return useQuery({
    queryKey: ["vendors", filters],
    queryFn: async () => {
      const userId = await fetchUserId();
      if (!userId) return { data: [], count: 0, pageCount: 0 };

      let query = supabase
        .from("vendors")
        .select(
          "id, name, email, phone, address, category_id, notes, created_at, categories(name, color)",
          { count: "exact" }
        )
        .eq("user_id", userId)
        .order("name")
        .range(filters.page * PAGE_SIZE, (filters.page + 1) * PAGE_SIZE - 1);

      if (filters.q) {
        query = query.or(
          `name.ilike.%${filters.q}%,email.ilike.%${filters.q}%`
        );
      }
      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      const { data: vendors, count } = await query;
      if (!vendors?.length) return { data: [], count: 0, pageCount: 0 };

      // Transaction stats per vendor
      const { data: txns } = await supabase
        .from("transactions")
        .select("vendor_id, amount")
        .eq("user_id", userId)
        .eq("type", "expense")
        .in(
          "vendor_id",
          vendors.map((v) => v.id)
        );

      const statsMap: Record<string, { count: number; total: number }> = {};
      for (const t of txns ?? []) {
        if (!t.vendor_id) continue;
        if (!statsMap[t.vendor_id])
          statsMap[t.vendor_id] = { count: 0, total: 0 };
        statsMap[t.vendor_id].count++;
        statsMap[t.vendor_id].total += t.amount;
      }

      return {
        data: vendors.map((v) => ({
          ...v,
          categories: v.categories as { name: string; color: string } | null,
          transaction_count: statsMap[v.id]?.count ?? 0,
          total_spent: statsMap[v.id]?.total ?? 0,
        })) as VendorRow[],
        count: count ?? 0,
        pageCount: Math.ceil((count ?? 0) / PAGE_SIZE),
      };
    },
  });
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: ["categories", "expense-for-vendors"],
    queryFn: async () => {
      const userId = await fetchUserId();
      if (!userId) return [];
      const { data } = await supabase
        .from("categories")
        .select("id, name, color")
        .eq("user_id", userId)
        .eq("type", "expense")
        .order("name");
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
