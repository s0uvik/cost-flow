import { Pencil, Trash2, AlertTriangle, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { BudgetRow } from '../hooks/useBudgets'

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

const PERIOD_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}

type Props = {
  budget: BudgetRow
  onEdit: (b: BudgetRow) => void
  onDelete: (b: BudgetRow) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: Props) {
  const isOver = budget.percentage >= 100
  const isWarning = budget.percentage >= 80 && !isOver
  const cat = budget.categories
  const remaining = budget.amount_limit - budget.spent

  return (
    <div className={`rounded-xl border p-5 space-y-4 transition-colors hover:bg-muted/30 ${isOver ? 'border-destructive/40 bg-destructive/5' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {cat && (
            <div
              className="size-9 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: cat.color }}
            >
              {cat.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold truncate">{budget.name}</p>
            {cat && <p className="text-xs text-muted-foreground truncate">{cat.name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="secondary" className="text-xs">{PERIOD_LABELS[budget.period]}</Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(budget)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(budget)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Spent</span>
          <span className={`font-semibold ${isOver ? 'text-destructive' : isWarning ? 'text-amber-600' : ''}`}>
            {formatINR(budget.spent)} / {formatINR(budget.amount_limit)}
          </span>
        </div>
        <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isOver ? 'bg-destructive' : isWarning ? 'bg-amber-500' : 'bg-primary'
            }`}
            style={{ width: `${budget.percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium ${isOver ? 'text-destructive' : isWarning ? 'text-amber-600' : 'text-muted-foreground'}`}>
            {Math.round(budget.percentage)}% used
          </span>
          {isOver ? (
            <span className="flex items-center gap-1 text-destructive font-medium">
              <AlertTriangle className="h-3 w-3" />
              Over by {formatINR(Math.abs(remaining))}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {formatINR(remaining)} left
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
