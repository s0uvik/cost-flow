import { TrendingUp, TrendingDown, Scale, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type Summary = {
  income: number;
  expenses: number;
  net: number;
  txCount: number;
};

type Props = {
  summary?: Summary;
  isLoading: boolean;
};

export function ReportSummaryCards({ summary, isLoading }: Props) {
  const cards = [
    {
      label: "Total Income",
      value: fmt.format(summary?.income ?? 0),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Total Expenses",
      value: fmt.format(summary?.expenses ?? 0),
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/30",
    },
    {
      label: "Net Balance",
      value: fmt.format(summary?.net ?? 0),
      icon: Scale,
      color: (summary?.net ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600",
      bg:
        (summary?.net ?? 0) >= 0
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : "bg-rose-50 dark:bg-rose-950/30",
    },
    {
      label: "Transactions",
      value: String(summary?.txCount ?? 0),
      icon: Receipt,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <div className={`rounded-lg p-2 ${c.bg}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
