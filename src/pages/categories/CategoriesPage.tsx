import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { CategoryList } from "./components/CategoryList";
import { CategoryDialog } from "./components/CategoryDialog";
import { DeleteCategoryDialog } from "./components/DeleteCategoryDialog";
import { useCategories } from "./hooks/useCategories";
import type { CategoryRow } from "./hooks/useCategories";

export function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<"income" | "expense">(
    "expense"
  );
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);

  function openCreate(type: "income" | "expense") {
    setDefaultType(type);
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(cat: CategoryRow) {
    setEditing(cat);
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organise your transactions with categories"
        action={
          <Button onClick={() => openCreate("expense")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
      />

      <div className="grid gap-8 md:grid-cols-2">
        <CategoryList
          categories={categories}
          isLoading={isLoading}
          type="income"
          onAdd={() => openCreate("income")}
          onEdit={openEdit}
          onDelete={setDeleting}
        />
        <CategoryList
          categories={categories}
          isLoading={isLoading}
          type="expense"
          onAdd={() => openCreate("expense")}
          onEdit={openEdit}
          onDelete={setDeleting}
        />
      </div>

      <CategoryDialog
        open={dialogOpen}
        editing={editing}
        defaultType={defaultType}
        onClose={handleCloseDialog}
      />

      <DeleteCategoryDialog
        category={deleting}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
