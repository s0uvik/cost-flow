import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateBudget, useUpdateBudget } from "../hooks/useBudgetMutations";
import type { BudgetRow } from "../hooks/useBudgets";
import { useCategories } from "./useExpenseCategories";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  amount_limit: z.coerce.number().positive("Must be greater than 0"),
  period: z.enum(["monthly", "quarterly", "yearly"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().nullable(),
  category_id: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  editing: BudgetRow | null;
  onClose: () => void;
};

export function BudgetDialog({ open, editing, onClose }: Props) {
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const { data: categories } = useCategories();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      amount_limit: 0,
      period: "monthly",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: null,
      category_id: null,
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        amount_limit: editing.amount_limit,
        period: editing.period,
        start_date: editing.start_date,
        end_date: editing.end_date,
        category_id: editing.category_id,
      });
    } else {
      form.reset({
        name: "",
        amount_limit: 0,
        period: "monthly",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: null,
        category_id: null,
      });
    }
  }, [editing, open]);

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      category_id: values.category_id || null,
      end_date: values.end_date || null,
    };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Budget" : "New Budget"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Monthly Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? null : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All expense categories" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        All expense categories
                      </SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="size-2 rounded-full inline-block"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount limit */}
            <FormField
              control={form.control}
              name="amount_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Limit (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period */}
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <div className="flex gap-2">
                    {(["monthly", "quarterly", "yearly"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => field.onChange(p)}
                        className={`flex-1 rounded-md border py-2 text-sm font-medium capitalize transition-colors ${
                          field.value === p
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:bg-muted"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      End Date{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Save Changes" : "Create Budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
