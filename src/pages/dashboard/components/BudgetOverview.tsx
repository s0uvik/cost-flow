import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useBudgetOverview } from '../hooks/useDashboardData'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function BudgetOverview() {
  const { data, isLoading } = useBudgetOverview()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>Spending vs limits this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))
          : data?.length === 0
          ? (
            <p className="text-sm text-muted-foreground text-center py-6">No budgets set up yet</p>
          )
          : data?.map((budget) => {
              const cat = budget.categories as { name: string; color: string } | null
              const isOver = budget.percentage >= 100
              const isWarning = budget.percentage >= 80

              return (
                <div key={budget.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {cat && (
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      )}
                      <span className="font-medium">{budget.name}</span>
                    </div>
                    <span className={`text-xs font-medium ${isOver ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.amount_limit)}
                    </span>
                  </div>
                  <Progress
                    value={budget.percentage}
                    className="h-2"
                    style={isOver ? { '--progress-color': 'oklch(0.577 0.245 27.325)' } as React.CSSProperties
                          : isWarning ? { '--progress-color': 'oklch(0.7 0.15 85)' } as React.CSSProperties
                          : undefined}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isOver
                      ? `Over budget by ${formatCurrency(budget.spent - budget.amount_limit)}`
                      : `${formatCurrency(budget.amount_limit - budget.spent)} remaining`}
                  </p>
                </div>
              )
            })}
      </CardContent>
    </Card>
  )
}
