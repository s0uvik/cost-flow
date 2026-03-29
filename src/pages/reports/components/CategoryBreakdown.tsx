import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type CatItem = { name: string; color: string; amount: number; count: number };

type Props = {
  expenseCategories?: CatItem[];
  incomeCategories?: CatItem[];
  isLoading: boolean;
};

function CategoryPane({ items }: { items: CatItem[] }) {
  if (!items.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No data for this period
      </div>
    );
  }

  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={items}
            dataKey="amount"
            nameKey="name"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {items.map((item, idx) => (
              <Cell key={idx} fill={item.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => fmt.format(v)} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex-1 space-y-2 min-w-0">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm truncate flex-1">{item.name}</span>
            <span className="text-xs text-muted-foreground">
              {((item.amount / total) * 100).toFixed(1)}%
            </span>
            <span className="text-sm font-medium tabular-nums">
              {fmt.format(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryBreakdown({
  expenseCategories,
  incomeCategories,
  isLoading,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Tabs defaultValue="expenses">
            <TabsList className="mb-4">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
            <TabsContent value="expenses">
              <CategoryPane items={expenseCategories ?? []} />
            </TabsContent>
            <TabsContent value="income">
              <CategoryPane items={incomeCategories ?? []} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
