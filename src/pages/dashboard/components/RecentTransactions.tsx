import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentTransactions } from "../hooks/useDashboardData";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function RecentTransactions() {
  const { data, isLoading } = useRecentTransactions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Last 5 transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))
        ) : data?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No transactions yet
          </p>
        ) : (
          data?.map((tx) => {
            const cat = tx.categories as { name: string; color: string } | null;
            const isIncome = tx.type === "income";
            return (
              <div key={tx.id} className="flex items-center gap-3">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                >
                  {isIncome ? (
                    <ArrowUpRight className="size-4" />
                  ) : (
                    <ArrowDownLeft className="size-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {tx.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(tx.date), "MMM d, yyyy")}
                    </span>
                    {cat && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0 h-4"
                        style={{
                          backgroundColor: cat.color + "22",
                          color: cat.color,
                        }}
                      >
                        {cat.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold shrink-0 ${isIncome ? "text-green-600" : "text-red-600"}`}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
