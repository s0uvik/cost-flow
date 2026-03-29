import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { Plus, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { InvoiceSummaryCards } from "./components/InvoiceSummaryCards";
import { InvoiceFilters } from "./components/InvoiceFilters";
import { InvoiceTable } from "./components/InvoiceTable";
import { DeleteInvoiceDialog } from "./components/DeleteInvoiceDialog";
import { useInvoices } from "./hooks/useInvoices";
import type { InvoiceRow } from "./hooks/useInvoices";

export function InvoiceListPage() {
  const navigate = useNavigate();
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
  const [deleting, setDeleting] = useState<InvoiceRow | null>(null);

  const { data, isLoading } = useInvoices({ q, status, page });

  function handleReset() {
    setQ("");
    setStatus("");
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage and track client invoices"
        action={
          <Button onClick={() => navigate({ to: "/invoices/new" })}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        }
      />

      <InvoiceSummaryCards />

      <InvoiceFilters
        q={q}
        status={status}
        onSearch={(v) => {
          setQ(v);
          setPage(0);
        }}
        onStatus={(v) => {
          setStatus(v);
          setPage(0);
        }}
        onReset={handleReset}
      />

      {!isLoading && data?.count === 0 && !q && !status ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium mb-1">No invoices yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first invoice to get started
          </p>
          <Button onClick={() => navigate({ to: "/invoices/new" })}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      ) : (
        <InvoiceTable
          data={data?.data ?? []}
          count={data?.count ?? 0}
          pageCount={data?.pageCount ?? 0}
          page={page}
          isLoading={isLoading}
          onDelete={setDeleting}
          onPageChange={setPage}
        />
      )}

      <DeleteInvoiceDialog
        invoice={deleting}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
