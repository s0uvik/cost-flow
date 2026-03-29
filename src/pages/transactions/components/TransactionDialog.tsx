import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, Banknote, CreditCard } from "lucide-react";
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
import { useCategories } from "../hooks/useTransactions";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "../hooks/useTransactionMutations";
import type { TransactionRow } from "../hooks/useTransactions";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  category_id: z.string().nullable(),
  notes: z.string().nullable(),
  payment_method: z.enum(["cash", "account"]),
  payment_reference: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  editing: TransactionRow | null;
  onClose: () => void;
};

export function TransactionDialog({ open, editing, onClose }: Props) {
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      amount: 0,
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      category_id: null,
      notes: null,
      payment_method: "cash",
      payment_reference: null,
    },
  });

  const selectedType = form.watch("type");
  const selectedPaymentMethod = form.watch("payment_method");

  useEffect(() => {
    if (editing) {
      form.reset({
        type: editing.type,
        amount: editing.amount,
        description: editing.description,
        date: editing.date,
        category_id: editing.category_id,
        notes: editing.notes,
        payment_method: editing.payment_method ?? "cash",
        payment_reference: editing.payment_reference,
      });
    } else {
      form.reset({
        type: "expense",
        amount: 0,
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        category_id: null,
        notes: null,
        payment_method: "cash",
        payment_reference: null,
      });
    }
  }, [editing, open]);

  const filteredCategories = categories?.filter(
    (c) => !selectedType || c.type === selectedType
  );

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      description: values.description.toUpperCase(),
      category_id: values.category_id || null,
      notes: values.notes || null,
      payment_reference:
        values.payment_method === "account"
          ? values.payment_reference || null
          : null,
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
          <DialogTitle>
            {editing ? "Edit Transaction" : "New Transaction"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(["income", "expense"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          field.onChange(t);
                          form.setValue("category_id", null);
                        }}
                        className={`flex-1 rounded-md border py-2 text-sm font-medium capitalize transition-colors ${
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

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="What was this for?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? null : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {filteredCategories?.map((cat) => (
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

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(["cash", "account"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          field.onChange(m);
                          if (m === "cash")
                            form.setValue("payment_reference", null);
                        }}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition-colors ${
                          field.value === m
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:bg-muted"
                        }`}
                      >
                        {m === "cash" ? (
                          <Banknote className="h-4 w-4" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        {m === "cash" ? "Cash" : "Account"}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account / Transaction Reference — shown only when payment_method = account */}
            {selectedPaymentMethod === "account" && (
              <FormField
                control={form.control}
                name="payment_reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Account No. / Transaction ID{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. XXXX1234 or UPI ref no."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Any additional notes..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Save Changes" : "Add Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
