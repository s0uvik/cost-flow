import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type TransactionRow = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  notes: string | null;
  category_id: string | null;
  categories: { name: string; color: string } | null;
  payment_method: "cash" | "account";
  payment_reference: string | null;
};

type Filters = {
  q?: string;
  type?: "income" | "expense" | "";
  categoryId?: string;
  paymentMethod?: "cash" | "account" | "";
  from?: string;
  to?: string;
  page: number;
};

const PAGE_SIZE = 10;

async function fetchUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export function useTransactions(filters: Filters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const userId = await fetchUserId();
      if (!userId) return { data: [], count: 0 };

      let query = supabase
        .from("transactions")
        .select(
          "id, type, amount, description, date, notes, category_id, payment_method, payment_reference, categories(name, color)",
          { count: "exact" },
        )
        .eq("user_id", userId);

      if (filters.q) query = query.ilike("description", `%${filters.q}%`);
      if (filters.type) query = query.eq("type", filters.type);
      if (filters.categoryId)
        query = query.eq("category_id", filters.categoryId);
      if (filters.paymentMethod)
        query = query.eq("payment_method", filters.paymentMethod);
      if (filters.from) query = query.gte("date", filters.from);
      if (filters.to) query = query.lte("date", filters.to);

      query = query
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(filters.page * PAGE_SIZE, (filters.page + 1) * PAGE_SIZE - 1);

      const { data, count } = await query;
      return {
        data: (data ?? []) as TransactionRow[],
        count: count ?? 0,
        pageCount: Math.ceil((count ?? 0) / PAGE_SIZE),
      };
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const userId = await fetchUserId();
      if (!userId) return [];
      const { data } = await supabase
        .from("categories")
        .select("id, name, color, type")
        .eq("user_id", userId)
        .order("name");
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
