import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteBudget } from "../hooks/useBudgetMutations";
import type { BudgetRow } from "../hooks/useBudgets";

type Props = {
  budget: BudgetRow | null;
  onClose: () => void;
};

export function DeleteBudgetDialog({ budget, onClose }: Props) {
  const deleteMutation = useDeleteBudget();

  async function handleDelete() {
    if (!budget) return;
    await deleteMutation.mutateAsync(budget.id);
    onClose();
  }

  return (
    <Dialog open={!!budget} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Budget</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              "{budget?.name}"
            </span>
            ? Your transactions will not be affected. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
