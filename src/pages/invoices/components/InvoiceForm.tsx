import { useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAllClients } from "@/pages/clients/hooks/useClients";
import {
  useCreateInvoice,
  useUpdateInvoice,
} from "../hooks/useInvoiceMutations";
import type { InvoiceDetail } from "../hooks/useInvoices";

const itemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Must be > 0"),
  unit_price: z.coerce.number().min(0, "Must be ≥ 0"),
  amount: z.number(),
});

const schema = z.object({
  client_id: z.string().nullable(),
  invoice_number: z.string().min(1, "Invoice number is required"),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().min(1, "Due date is required"),
  tax_rate: z.coerce.number().min(0).max(100),
  discount_amount: z.coerce.number().min(0),
  notes: z.string().nullable(),
  terms: z.string().nullable(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});

type FormValues = z.infer<typeof schema>;

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

type Props = {
  invoiceNumber: string;
  editing?: InvoiceDetail;
  onSaved?: (id: string) => void;
  onCancel: () => void;
};

export function InvoiceForm({
  invoiceNumber,
  editing,
  onSaved,
  onCancel,
}: Props) {
  const navigate = useNavigate();
  const { data: clients } = useAllClients();
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_id: null,
      invoice_number: invoiceNumber,
      status: "draft",
      issue_date: format(new Date(), "yyyy-MM-dd"),
      due_date: format(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd"
      ),
      tax_rate: 0,
      discount_amount: 0,
      notes: null,
      terms: null,
      items: [{ description: "", quantity: 1, unit_price: 0, amount: 0 }],
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        client_id: editing.client_id,
        invoice_number: editing.invoice_number,
        status: editing.status,
        issue_date: editing.issue_date,
        due_date: editing.due_date,
        tax_rate: editing.tax_rate,
        discount_amount: editing.discount_amount,
        notes: editing.notes,
        terms: editing.terms,
        items: editing.invoice_items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          amount: it.amount,
        })),
      });
    }
  }, [editing]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = useWatch({ control: form.control, name: "items" });
  const taxRate = useWatch({ control: form.control, name: "tax_rate" });
  const discountAmount = useWatch({
    control: form.control,
    name: "discount_amount",
  });

  const subtotal = (watchedItems ?? []).reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  const taxAmount = subtotal * ((taxRate || 0) / 100);
  const total = subtotal + taxAmount - (discountAmount || 0);

  function updateItemAmount(index: number) {
    const qty = form.getValues(`items.${index}.quantity`) || 0;
    const price = form.getValues(`items.${index}.unit_price`) || 0;
    form.setValue(`items.${index}.amount`, qty * price, {
      shouldValidate: false,
    });
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      client_id: values.client_id || null,
      invoice_number: values.invoice_number,
      status: values.status,
      issue_date: values.issue_date,
      due_date: values.due_date,
      subtotal,
      tax_rate: values.tax_rate,
      tax_amount: taxAmount,
      discount_amount: values.discount_amount,
      total,
      notes: values.notes || null,
      terms: values.terms || null,
      items: values.items.map((item, i) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
        sort_order: i,
      })),
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, ...payload });
      onSaved?.(editing.id);
    } else {
      const id = await createMutation.mutateAsync(payload);
      onSaved ? onSaved(id) : navigate({ to: "/invoices/$id", params: { id } });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? null : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No client</SelectItem>
                      {clients?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                          {c.company ? ` — ${c.company}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto pb-1">
              <div className="min-w-[640px] space-y-3">
                <div className="grid grid-cols-[1fr_80px_120px_100px_36px] gap-2 px-1 text-xs font-medium text-muted-foreground">
                  <span>Description</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Unit Price</span>
                  <span className="text-right">Amount</span>
                  <span />
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_80px_120px_100px_36px] items-start gap-2"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field: f }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input placeholder="Item description" {...f} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field: f }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              className="text-center"
                              {...f}
                              onChange={(e) => {
                                f.onChange(e);
                                updateItemAmount(index);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_price`}
                      render={({ field: f }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="text-right"
                              {...f}
                              onChange={(e) => {
                                f.onChange(e);
                                updateItemAmount(index);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex h-9 items-center justify-end text-sm font-medium">
                      {formatINR(watchedItems?.[index]?.amount ?? 0)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  description: "",
                  quantity: 1,
                  unit_price: 0,
                  amount: 0,
                })
              }
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Item
            </Button>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="ml-auto w-full space-y-2 sm:w-72">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  <span>Tax</span>
                  <FormField
                    control={form.control}
                    name="tax_rate"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <div className="flex items-center">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              className="h-6 w-16 text-xs text-right"
                              {...field}
                            />
                            <span className="ml-1 text-xs">%</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <span className="font-medium sm:text-right">{formatINR(taxAmount)}</span>
              </div>
              <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  <span>Discount</span>
                  <FormField
                    control={form.control}
                    name="discount_amount"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="h-6 w-24 text-xs text-right"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <span className="font-medium text-red-600 sm:text-right">
                  -{formatINR(discountAmount || 0)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-green-600">
                  {formatINR(total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes & Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes for the client..."
                      rows={4}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Payment terms, conditions..."
                      rows={4}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editing ? "Save Changes" : "Create Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
