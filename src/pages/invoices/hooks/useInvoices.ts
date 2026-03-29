import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type InvoiceRow = {
  id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes: string | null;
  client_id: string | null;
  clients: { name: string; company: string | null } | null;
};

type Filters = {
  q: string;
  status: string;
  page: number;
};

const PAGE_SIZE = 10;

async function fetchUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export function useInvoices(filters: Filters) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: async () => {
      const userId = await fetchUserId();
      if (!userId) return { data: [], count: 0, pageCount: 0 };

      let query = supabase
        .from("invoices")
        .select(
          "id, invoice_number, status, issue_date, due_date, subtotal, tax_amount, discount_amount, total, notes, client_id, clients(name, company)",
          { count: "exact" },
        )
        .eq("user_id", userId)
        .order("issue_date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(filters.page * PAGE_SIZE, (filters.page + 1) * PAGE_SIZE - 1);

      if (filters.status)
        query = query.eq("status", filters.status as InvoiceStatus);
      if (filters.q) query = query.ilike("invoice_number", `%${filters.q}%`);

      const { data, count } = await query;
      return {
        data: (data ?? []) as InvoiceRow[],
        count: count ?? 0,
        pageCount: Math.ceil((count ?? 0) / PAGE_SIZE),
      };
    },
  });
}

export function useInvoiceSummary() {
  return useQuery({
    queryKey: ["invoices", "summary"],
    queryFn: async () => {
      const userId = await fetchUserId();
      if (!userId) return null;

      const { data } = await supabase
        .from("invoices")
        .select("status, total")
        .eq("user_id", userId);

      const all = data ?? [];
      return {
        total: all.reduce((s, i) => s + i.total, 0),
        paid: all
          .filter((i) => i.status === "paid")
          .reduce((s, i) => s + i.total, 0),
        outstanding: all
          .filter((i) => ["sent", "overdue"].includes(i.status))
          .reduce((s, i) => s + i.total, 0),
        overdue: all.filter((i) => i.status === "overdue").length,
        counts: {
          all: all.length,
          draft: all.filter((i) => i.status === "draft").length,
          sent: all.filter((i) => i.status === "sent").length,
          paid: all.filter((i) => i.status === "paid").length,
          overdue: all.filter((i) => i.status === "overdue").length,
          cancelled: all.filter((i) => i.status === "cancelled").length,
        },
      };
    },
  });
}
