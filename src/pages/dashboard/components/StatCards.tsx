import { TrendingUp, TrendingDown, Wallet, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "../hooks/useDashboardData";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function StatCards() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const net = data?.net ?? 0;
  const cards = [
    {
      title: "Income",
      value: formatCurrency(data?.income ?? 0),
      sub: "This month",
      icon: TrendingUp,
      iconClass: "text-green-500",
      valueClass: "text-green-600",
    },
    {
      title: "Expenses",
      value: formatCurrency(data?.expenses ?? 0),
      sub: "This month",
      icon: TrendingDown,
      iconClass: "text-red-500",
      valueClass: "text-red-600",
    },
    {
      title: "Net Balance",
      value: formatCurrency(net),
      sub: "Income minus expenses",
      icon: Wallet,
      iconClass: net >= 0 ? "text-green-500" : "text-red-500",
      valueClass: net >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Outstanding",
      value: formatCurrency(data?.outstanding ?? 0),
      sub: `${data?.outstandingCount ?? 0} invoice${(data?.outstandingCount ?? 0) !== 1 ? "s" : ""}`,
      icon: FileText,
      iconClass: "text-amber-500",
      valueClass: "text-amber-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.iconClass}`} />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${card.valueClass}`}>
              {card.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
