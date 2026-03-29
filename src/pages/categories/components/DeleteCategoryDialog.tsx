import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteCategory } from "../hooks/useCategoryMutations";
import type { CategoryRow } from "../hooks/useCategories";

type Props = {
  category: CategoryRow | null;
  onClose: () => void;
};

export function DeleteCategoryDialog({ category, onClose }: Props) {
  const deleteMutation = useDeleteCategory();

  async function handleDelete() {
    if (!category) return;
    await deleteMutation.mutateAsync(category.id);
    onClose();
  }

  return (
    <Dialog open={!!category} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Category
          </DialogTitle>
          <DialogDescription className="pt-1">
            Delete{" "}
            <span className="font-medium text-foreground">
              "{category?.name}"
            </span>
            ?{" "}
            {(category?.transaction_count ?? 0) > 0 && (
              <span className="text-destructive font-medium">
                This will unlink {category?.transaction_count} transaction
                {category?.transaction_count !== 1 ? "s" : ""}.
              </span>
            )}{" "}
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
