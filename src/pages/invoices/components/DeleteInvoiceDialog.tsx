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
import { useDeleteInvoice } from "../hooks/useInvoiceMutations";
import type { InvoiceRow } from "../hooks/useInvoices";

type Props = {
  invoice: InvoiceRow | null;
  onClose: () => void;
  onDeleted?: () => void;
};

export function DeleteInvoiceDialog({ invoice, onClose, onDeleted }: Props) {
  const deleteMutation = useDeleteInvoice();

  async function handleDelete() {
    if (!invoice) return;
    await deleteMutation.mutateAsync(invoice.id);
    onClose();
    onDeleted?.();
  }

  return (
    <Dialog open={!!invoice} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Invoice</DialogTitle>
          <DialogDescription>
            Delete invoice{" "}
            <span className="font-medium text-foreground">
              {invoice?.invoice_number}
            </span>
            ? All line items will also be removed. This cannot be undone.
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
