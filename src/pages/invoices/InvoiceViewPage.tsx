import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { format, parseISO, isPast } from "date-fns";
import {
  ArrowLeft,
  Pencil,
  Download,
  Loader2,
  Building2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { InvoiceStatusBadge } from "./components/InvoiceStatusBadge";
import { InvoiceForm } from "./components/InvoiceForm";
import { DeleteInvoiceDialog } from "./components/DeleteInvoiceDialog";
import { useInvoice } from "./hooks/useInvoices";
import { useUpdateInvoiceStatus } from "./hooks/useInvoiceMutations";
import { generateInvoicePdf } from "./utils/generateInvoicePdf";
import { useProfile } from "@/pages/settings/hooks/useProfile";
import type { InvoiceRow, InvoiceStatus } from "./hooks/useInvoices";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

const NEXT_STATUSES: Partial<
  Record<InvoiceStatus, { label: string; value: InvoiceStatus }[]>
> = {
  draft: [{ label: "Mark as Sent", value: "sent" }],
  sent: [
    { label: "Mark as Paid", value: "paid" },
    { label: "Mark as Overdue", value: "overdue" },
  ],
  overdue: [{ label: "Mark as Paid", value: "paid" }],
};

export function InvoiceViewPage() {
  const { id } = useParams({ from: "/_app/invoices/$id" });
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: invoice, isLoading } = useInvoice(id);
  const { data: profile } = useProfile();
  const statusMutation = useUpdateInvoiceStatus();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Invoice not found.
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Edit ${invoice.invoice_number}`}
          action={
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel Edit
            </Button>
          }
        />
        <InvoiceForm
          invoiceNumber={invoice.invoice_number}
          editing={invoice}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      </div>
    );
  }

  const client = invoice.clients;
  const nextStatuses = NEXT_STATUSES[invoice.status] ?? [];
  const isDueOverdue =
    invoice.status === "sent" && isPast(parseISO(invoice.due_date));

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.invoice_number}
        description={`Created ${format(parseISO(invoice.issue_date), "dd MMM yyyy")}`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/invoices" })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {(invoice.status === "draft" || invoice.status === "sent") && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() =>
                generateInvoicePdf(
                  invoice,
                  profile?.business_name ?? undefined,
                  profile?.currency ?? "INR"
                )
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        }
      />

      {/* Main invoice card — print-friendly */}
      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">INVOICE</h1>
              <p className="text-muted-foreground font-mono text-sm mt-1">
                {invoice.invoice_number}
              </p>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>

          <Separator />

          {/* Client + Dates */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Bill To
              </p>
              {client ? (
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-base">{client.name}</p>
                  {client.company && (
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {client.company}
                    </p>
                  )}
                  {client.email && (
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {client.phone}
                    </p>
                  )}
                  {client.address && (
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {client.address}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No client</p>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Details
              </p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Date</span>
                <span className="font-medium">
                  {format(parseISO(invoice.issue_date), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span
                  className={`font-medium ${isDueOverdue ? "text-destructive" : ""}`}
                >
                  {format(parseISO(invoice.due_date), "dd MMM yyyy")}
                  {isDueOverdue && " (Overdue)"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Line Items Table */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-semibold text-muted-foreground">
                    Description
                  </th>
                  <th className="text-center pb-3 font-semibold text-muted-foreground w-16">
                    Qty
                  </th>
                  <th className="text-right pb-3 font-semibold text-muted-foreground w-32">
                    Unit Price
                  </th>
                  <th className="text-right pb-3 font-semibold text-muted-foreground w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.invoice_items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-center text-muted-foreground">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {formatINR(item.unit_price)}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatINR(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatINR(invoice.subtotal)}</span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({invoice.tax_rate}%)
                  </span>
                  <span>{formatINR(invoice.tax_amount)}</span>
                </div>
              )}
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-red-600">
                    -{formatINR(invoice.discount_amount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-green-600">
                  {formatINR(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-8 text-sm">
                {invoice.notes && (
                  <div>
                    <p className="font-semibold mb-1">Notes</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {invoice.notes}
                    </p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="font-semibold mb-1">Terms & Conditions</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {invoice.terms}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status Actions */}
      {(nextStatuses.length > 0 ||
        invoice.status === "draft" ||
        invoice.status === "cancelled") && (
        <div className="flex items-center gap-2 print:hidden">
          {nextStatuses.map((s) => (
            <Button
              key={s.value}
              variant="outline"
              disabled={statusMutation.isPending}
              onClick={() =>
                statusMutation.mutate({ id: invoice.id, status: s.value })
              }
            >
              {statusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {s.label}
            </Button>
          ))}
          {(invoice.status === "draft" || invoice.status === "cancelled") && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive ml-auto"
              onClick={() => setDeleting(true)}
            >
              Delete Invoice
            </Button>
          )}
        </div>
      )}

      <DeleteInvoiceDialog
        invoice={deleting ? (invoice as unknown as InvoiceRow) : null}
        onClose={() => setDeleting(false)}
        onDeleted={() => navigate({ to: "/invoices" })}
      />
    </div>
  );
}
