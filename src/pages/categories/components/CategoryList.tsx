import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryCard } from "./CategoryCard";
import type { CategoryRow } from "../hooks/useCategories";

type Props = {
  categories: CategoryRow[];
  isLoading: boolean;
  type: "income" | "expense";
  onAdd: () => void;
  onEdit: (c: CategoryRow) => void;
  onDelete: (c: CategoryRow) => void;
};

export function CategoryList({
  categories,
  isLoading,
  type,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const filtered = categories.filter((c) => c.type === type);
  const isIncome = type === "income";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`size-2.5 rounded-full ${isIncome ? "bg-green-500" : "bg-red-500"}`}
          />
          <h3 className="font-semibold capitalize">{type}</h3>
          <span className="text-sm text-muted-foreground">
            ({filtered.length})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={onAdd}
        >
          <Plus className="h-3.5 w-3.5" />
          Add {type}
        </Button>
      </div>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border p-4"
          >
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            No {type} categories yet
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add first {type} category
          </Button>
        </div>
      ) : (
        filtered.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}
