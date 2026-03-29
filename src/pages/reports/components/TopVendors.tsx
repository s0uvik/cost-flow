import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type VendorItem = { name: string; amount: number; count: number };

type Props = {
  vendors?: VendorItem[];
  isLoading: boolean;
};

export function TopVendors({ vendors, isLoading }: Props) {
  const max = vendors?.[0]?.amount ?? 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Vendors</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !vendors?.length ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No vendor data for this period
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map((v, i) => (
              <div key={v.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium shrink-0">
                      {i + 1}
                    </div>
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{v.name}</span>
                  </div>
                  <div className="text-right ml-2 shrink-0">
                    <p className="text-sm font-medium">
                      {fmt.format(v.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {v.count} txn{v.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500"
                    style={{ width: `${(v.amount / max) * 100}%` }}
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
