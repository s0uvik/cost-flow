import { useState } from "react";
import { Plus, PiggyBank } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetCard } from "./components/BudgetCard";
import { BudgetSummary } from "./components/BudgetSummary";
import { BudgetDialog } from "./components/BudgetDialog";
import { DeleteBudgetDialog } from "./components/DeleteBudgetDialog";
import { useBudgets } from "./hooks/useBudgets";
import type { BudgetRow } from "./hooks/useBudgets";

export function BudgetsPage() {
  const { data: budgets = [], isLoading } = useBudgets();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetRow | null>(null);
  const [deleting, setDeleting] = useState<BudgetRow | null>(null);

  function handleEdit(b: BudgetRow) {
    setEditing(b);
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Set spending limits and track progress"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Budget
          </Button>
        }
      />

      {/* Summary bar */}
      {!isLoading && <BudgetSummary budgets={budgets} />}

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-9 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <PiggyBank className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium mb-1">No budgets yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first budget to start tracking spending
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Budget
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={handleEdit}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <BudgetDialog
        open={dialogOpen}
        editing={editing}
        onClose={handleCloseDialog}
      />
      <DeleteBudgetDialog budget={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}
