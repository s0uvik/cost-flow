import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CategoryRow } from "../hooks/useCategories";

type Props = {
  category: CategoryRow;
  onEdit: (c: CategoryRow) => void;
  onDelete: (c: CategoryRow) => void;
};

export function CategoryCard({ category, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/40 transition-colors group">
      {/* Color dot */}
      <div
        className="size-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
        style={{ backgroundColor: category.color }}
      >
        {category.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{category.name}</p>
          {category.is_default && (
            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0 h-4 shrink-0"
            >
              Default
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {category.transaction_count ?? 0} transaction
          {(category.transaction_count ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(category)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(category)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
