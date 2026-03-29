import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type MonthPoint = { month: string; income: number; expenses: number };

type Props = {
  data?: MonthPoint[];
  isLoading: boolean;
};

export function IncomeExpenseChart({ data, isLoading }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : !data?.length ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={224}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) =>
                  `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                }
                tick={{ fontSize: 11 }}
                width={56}
              />
              <Tooltip formatter={(v: number) => fmt.format(v)} />
              <Legend />
              <Bar
                dataKey="income"
                name="Income"
                fill="var(--color-emerald-500, #10b981)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="var(--color-rose-500, #f43f5e)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
