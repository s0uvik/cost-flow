import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type CategoryRow = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
  is_default: boolean;
  created_at: string;
  transaction_count?: number;
};

async function fetchUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories", "list"],
    queryFn: async () => {
      const userId = await fetchUserId();
      if (!userId) return [];

      // Fetch categories with transaction counts
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name, type, color, icon, is_default, created_at")
        .eq("user_id", userId)
        .order("type")
        .order("name");

      if (!categories?.length) return [];

      // Fetch transaction counts per category
      const { data: counts } = await supabase
        .from("transactions")
        .select("category_id")
        .eq("user_id", userId)
        .in(
          "category_id",
          categories.map((c) => c.id)
        );

      const countMap: Record<string, number> = {};
      for (const tx of counts ?? []) {
        if (tx.category_id)
          countMap[tx.category_id] = (countMap[tx.category_id] ?? 0) + 1;
      }

      return categories.map((c) => ({
        ...c,
        transaction_count: countMap[c.id] ?? 0,
      })) as CategoryRow[];
    },
  });
}
