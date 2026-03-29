import { FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoiceSummary } from "../hooks/useInvoices";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function InvoiceSummaryCards() {
  const { data, isLoading } = useInvoiceSummary();

  const cards = [
    {
      label: "Total Invoiced",
      value: formatINR(data?.total ?? 0),
      icon: FileText,
      iconClass: "text-blue-500",
    },
    {
      label: "Paid",
      value: formatINR(data?.paid ?? 0),
      icon: CheckCircle2,
      iconClass: "text-green-500",
    },
    {
      label: "Outstanding",
      value: formatINR(data?.outstanding ?? 0),
      icon: Clock,
      iconClass: "text-amber-500",
    },
    {
      label: "Overdue",
      value: `${data?.overdue ?? 0} invoice${(data?.overdue ?? 0) !== 1 ? "s" : ""}`,
      icon: AlertTriangle,
      iconClass:
        (data?.overdue ?? 0) > 0 ? "text-destructive" : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4 flex items-center gap-3">
            {isLoading ? (
              <>
                <Skeleton className="size-5 rounded" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </>
            ) : (
              <>
                <c.icon className={`h-5 w-5 shrink-0 ${c.iconClass}`} />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="font-semibold text-sm">{c.value}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
