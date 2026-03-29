import { useQuery } from "@tanstack/react-query";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import { supabase } from "@/lib/supabase";

function useUserId() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });
}

export function useDashboardStats() {
  const { data: user } = useUserId();
  const userId = user?.id;

  return useQuery({
    queryKey: ["dashboard", "stats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

      const [txRes, invRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("type, amount")
          .eq("user_id", userId!)
          .gte("date", monthStart)
          .lte("date", monthEnd),
        supabase
          .from("invoices")
          .select("total, status")
          .eq("user_id", userId!)
          .in("status", ["sent", "overdue"]),
      ]);

      const txns = txRes.data ?? [];
      const invoices = invRes.data ?? [];

      const income = txns
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const expenses = txns
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      const outstanding = invoices.reduce((s, i) => s + i.total, 0);

      return {
        income,
        expenses,
        net: income - expenses,
        outstanding,
        outstandingCount: invoices.length,
      };
    },
  });
}

export function useMonthlyChart() {
  const { data: user } = useUserId();
  const userId = user?.id;

  return useQuery({
    queryKey: ["dashboard", "monthly-chart", userId],
    enabled: !!userId,
    queryFn: async () => {
      const now = new Date();
      const rangeStart = format(startOfMonth(subMonths(now, 5)), "yyyy-MM-dd");
      const rangeEnd = format(endOfMonth(now), "yyyy-MM-dd");

      const { data } = await supabase
        .from("transactions")
        .select("type, amount, date")
        .eq("user_id", userId!)
        .gte("date", rangeStart)
        .lte("date", rangeEnd);

      const months: Record<
        string,
        { month: string; income: number; expenses: number }
      > = {};
      for (let i = 5; i >= 0; i--) {
        const m = subMonths(now, i);
        const key = format(m, "yyyy-MM");
        months[key] = { month: format(m, "MMM yy"), income: 0, expenses: 0 };
      }

      for (const t of data ?? []) {
        const key = t.date.substring(0, 7);
        if (months[key]) {
          if (t.type === "income") months[key].income += t.amount;
          else months[key].expenses += t.amount;
        }
      }

      return Object.values(months);
    },
  });
}

export function useCategoryExpenses() {
  const { data: user } = useUserId();
  const userId = user?.id;

  return useQuery({
    queryKey: ["dashboard", "category-expenses", userId],
    enabled: !!userId,
    queryFn: async () => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

      const { data } = await supabase
        .from("transactions")
        .select("amount, categories(name, color)")
        .eq("user_id", userId!)
        .eq("type", "expense")
        .gte("date", monthStart)
        .lte("date", monthEnd)
        .not("category_id", "is", null);

      const byCategory: Record<
        string,
        { name: string; color: string; amount: number }
      > = {};
      for (const t of data ?? []) {
        const cat = t.categories as { name: string; color: string } | null;
        if (cat) {
          if (!byCategory[cat.name])
            byCategory[cat.name] = {
              name: cat.name,
              color: cat.color,
              amount: 0,
            };
          byCategory[cat.name].amount += t.amount;
        }
      }

      return Object.values(byCategory)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);
    },
  });
}

export function useRecentTransactions() {
  const { data: user } = useUserId();
  const userId = user?.id;

  return useQuery({
    queryKey: ["dashboard", "recent-transactions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("id, type, amount, description, date, categories(name, color)")
        .eq("user_id", userId!)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      return data ?? [];
    },
  });
}

export function useBudgetOverview() {
  const { data: user } = useUserId();
  const userId = user?.id;

  return useQuery({
    queryKey: ["dashboard", "budgets", userId],
    enabled: !!userId,
    queryFn: async () => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

      const [budgetsRes, txRes] = await Promise.all([
        supabase
          .from("budgets")
          .select(
            "id, name, amount_limit, period, category_id, categories(name, color)",
          )
          .eq("user_id", userId!)
          .lte("start_date", monthEnd),
        supabase
          .from("transactions")
          .select("amount, category_id")
          .eq("user_id", userId!)
          .eq("type", "expense")
          .gte("date", monthStart)
          .lte("date", monthEnd),
      ]);

      const budgets = budgetsRes.data ?? [];
      const txns = txRes.data ?? [];

      return budgets.map((b) => {
        const spent = txns
          .filter((t) => t.category_id === b.category_id)
          .reduce((s, t) => s + t.amount, 0);
        return {
          ...b,
          spent,
          percentage: Math.min((spent / b.amount_limit) * 100, 100),
        };
      });
    },
  });
}
