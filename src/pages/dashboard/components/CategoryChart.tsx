import { Cell, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useCategoryExpenses } from "../hooks/useDashboardData";

export function CategoryChart() {
  const { data, isLoading } = useCategoryExpenses();

  const chartConfig: ChartConfig = Object.fromEntries(
    (data ?? []).map((c) => [c.name, { label: c.name, color: c.color }]),
  );

  const isEmpty = !data || data.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>This month</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : isEmpty ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            No expense data this month
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ChartContainer
              config={chartConfig}
              className="h-[200px] w-[200px] shrink-0"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="name" />}
                />
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  strokeWidth={2}
                >
                  {data!.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-2 min-w-0">
              {data!.map((entry) => {
                const total = data!.reduce((s, c) => s + c.amount, 0);
                const pct =
                  total > 0 ? Math.round((entry.amount / total) * 100) : 0;
                return (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2 text-sm min-w-0"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="truncate text-muted-foreground">
                      {entry.name}
                    </span>
                    <span className="ml-auto font-medium shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
