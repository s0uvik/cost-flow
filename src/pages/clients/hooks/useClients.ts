import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
  invoice_count: number;
  total_billed: number;
};

async function fetchUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

type Filters = { q: string; page: number };
const PAGE_SIZE = 12;

export function useClients(filters: Filters) {
  return useQuery({
    queryKey: ["clients", filters],
    queryFn: async () => {
      const userId = await fetchUserId();
      if (!userId) return { data: [], count: 0, pageCount: 0 };

      let query = supabase
        .from("clients")
        .select("id, name, email, phone, address, company, notes, created_at", {
          count: "exact",
        })
        .eq("user_id", userId)
        .order("name")
        .range(filters.page * PAGE_SIZE, (filters.page + 1) * PAGE_SIZE - 1);

      if (filters.q) {
        query = query.or(
          `name.ilike.%${filters.q}%,company.ilike.%${filters.q}%,email.ilike.%${filters.q}%`,
        );
      }

      const { data: clients, count } = await query;
      if (!clients?.length) return { data: [], count: 0, pageCount: 0 };

      // Fetch invoice stats per client
      const { data: invoices } = await supabase
        .from("invoices")
        .select("client_id, total, status")
        .eq("user_id", userId)
        .in(
          "client_id",
          clients.map((c) => c.id),
        )
        .neq("status", "cancelled");

      const statsMap: Record<string, { count: number; total: number }> = {};
      for (const inv of invoices ?? []) {
        if (!inv.client_id) continue;
        if (!statsMap[inv.client_id])
          statsMap[inv.client_id] = { count: 0, total: 0 };
        statsMap[inv.client_id].count++;
        statsMap[inv.client_id].total += inv.total;
      }

      return {
        data: clients.map((c) => ({
          ...c,
          invoice_count: statsMap[c.id]?.count ?? 0,
          total_billed: statsMap[c.id]?.total ?? 0,
        })) as ClientRow[],
        count: count ?? 0,
        pageCount: Math.ceil((count ?? 0) / PAGE_SIZE),
      };
    },
  });
}
