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
import { useDeleteTransaction } from "../hooks/useTransactionMutations";
import type { TransactionRow } from "../hooks/useTransactions";

type Props = {
  transaction: TransactionRow | null;
  onClose: () => void;
};

export function DeleteTransactionDialog({ transaction, onClose }: Props) {
  const deleteMutation = useDeleteTransaction();

  async function handleDelete() {
    if (!transaction) return;
    await deleteMutation.mutateAsync(transaction.id);
    onClose();
  }

  return (
    <Dialog open={!!transaction} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              "{transaction?.description}"
            </span>
            ? This action cannot be undone.
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
