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
import { useDeleteClient } from "../hooks/useClientMutations";
import type { ClientRow } from "../hooks/useClients";

type Props = {
  client: ClientRow | null;
  onClose: () => void;
};

export function DeleteClientDialog({ client, onClose }: Props) {
  const deleteMutation = useDeleteClient();

  async function handleDelete() {
    if (!client) return;
    await deleteMutation.mutateAsync(client.id);
    onClose();
  }

  return (
    <Dialog open={!!client} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Client</DialogTitle>
          <DialogDescription>
            Delete{" "}
            <span className="font-medium text-foreground">
              "{client?.name}"
            </span>
            ?{" "}
            {(client?.invoice_count ?? 0) > 0 && (
              <span className="text-amber-600 font-medium">
                This client has {client?.invoice_count} invoice
                {client?.invoice_count !== 1 ? "s" : ""} that will be
                unlinked.{" "}
              </span>
            )}
            This action cannot be undone.
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
