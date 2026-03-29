import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type ClientItem = { name: string; amount: number; count: number };

type Props = {
  clients?: ClientItem[];
  isLoading: boolean;
};

export function TopClients({ clients, isLoading }: Props) {
  const max = clients?.[0]?.amount ?? 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Clients</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !clients?.length ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No client data for this period
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((c, i) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium shrink-0">
                      {i + 1}
                    </div>
                    <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{c.name}</span>
                  </div>
                  <div className="text-right ml-2 shrink-0">
                    <p className="text-sm font-medium">
                      {fmt.format(c.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.count} invoice{c.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(c.amount / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
