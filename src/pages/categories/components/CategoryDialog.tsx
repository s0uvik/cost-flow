import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useCreateCategory,
  useUpdateCategory,
} from "../hooks/useCategoryMutations";
import type { CategoryRow } from "../hooks/useCategories";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#65a30d",
  "#16a34a",
  "#0d9488",
  "#0891b2",
  "#2563eb",
  "#4f46e5",
  "#7c3aed",
  "#db2777",
  "#475569",
];

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["income", "expense"]),
  color: z.string().min(1, "Pick a color"),
  icon: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  editing: CategoryRow | null;
  defaultType?: "income" | "expense";
  onClose: () => void;
};

export function CategoryDialog({
  open,
  editing,
  defaultType = "expense",
  onClose,
}: Props) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: defaultType,
      color: PRESET_COLORS[5],
      icon: null,
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        type: editing.type,
        color: editing.color,
        icon: editing.icon,
      });
    } else {
      form.reset({
        name: "",
        type: defaultType,
        color: PRESET_COLORS[5],
        icon: null,
      });
    }
  }, [editing, open, defaultType]);

  async function onSubmit(values: FormValues) {
    const payload = { ...values, icon: values.icon || null };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedColor = form.watch("color");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Category" : "New Category"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type toggle */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <div className="flex gap-2">
                    {(["income", "expense"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        disabled={!!editing}
                        onClick={() => field.onChange(t)}
                        className={`flex-1 rounded-md border py-2 text-sm font-medium capitalize transition-colors disabled:opacity-50 ${
                          field.value === t
                            ? t === "income"
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-red-500 bg-red-50 text-red-700"
                            : "border-input hover:bg-muted"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Food & Dining" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        className={`size-7 rounded-full transition-transform hover:scale-110 ${
                          field.value === color
                            ? "ring-2 ring-offset-2 ring-foreground scale-110"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {/* Preview */}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: selectedColor + "22",
                        color: selectedColor,
                      }}
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: selectedColor }}
                      />
                      {form.watch("name") || "Preview"}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
