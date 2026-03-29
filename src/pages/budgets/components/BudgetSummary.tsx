import { TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { BudgetRow } from "../hooks/useBudgets";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

type Props = { budgets: BudgetRow[] };

export function BudgetSummary({ budgets }: Props) {
  if (!budgets.length) return null;

  const totalLimit = budgets.reduce((s, b) => s + b.amount_limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overCount = budgets.filter((b) => b.percentage >= 100).length;
  const onTrackCount = budgets.filter((b) => b.percentage < 80).length;

  const stats = [
    {
      label: "Total Budgeted",
      value: formatINR(totalLimit),
      icon: TrendingUp,
      iconClass: "text-blue-500",
    },
    {
      label: "Total Spent",
      value: formatINR(totalSpent),
      icon: TrendingUp,
      iconClass:
        totalSpent > totalLimit ? "text-destructive" : "text-green-500",
    },
    {
      label: "Over Budget",
      value: `${overCount} budget${overCount !== 1 ? "s" : ""}`,
      icon: AlertTriangle,
      iconClass: overCount > 0 ? "text-destructive" : "text-muted-foreground",
    },
    {
      label: "On Track",
      value: `${onTrackCount} budget${onTrackCount !== 1 ? "s" : ""}`,
      icon: CheckCircle2,
      iconClass: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <s.icon className={`h-5 w-5 shrink-0 ${s.iconClass}`} />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {s.label}
              </p>
              <p className="font-semibold text-sm truncate">{s.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
