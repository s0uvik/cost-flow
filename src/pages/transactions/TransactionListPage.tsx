import { useState } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { TransactionFilters } from "./components/TransactionFilters";
import { TransactionTable } from "./components/TransactionTable";
import { TransactionDialog } from "./components/TransactionDialog";
import { DeleteTransactionDialog } from "./components/DeleteTransactionDialog";
import { useTransactions } from "./hooks/useTransactions";
import type { TransactionRow } from "./hooks/useTransactions";

export function TransactionListPage() {
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [type, setType] = useQueryState("type", parseAsString.withDefault(""));
  const [categoryId, setCategoryId] = useQueryState(
    "category",
    parseAsString.withDefault("")
  );
  const [paymentMethod, setPaymentMethod] = useQueryState(
    "payment",
    parseAsString.withDefault("")
  );
  const [from, setFrom] = useQueryState("from", parseAsString.withDefault(""));
  const [to, setTo] = useQueryState("to", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionRow | null>(null);
  const [deleting, setDeleting] = useState<TransactionRow | null>(null);

  const { data, isLoading } = useTransactions({
    q,
    type: type as "" | "income" | "expense",
    categoryId,
    paymentMethod: paymentMethod as "" | "cash" | "account",
    from,
    to,
    page,
  });

  function handleEdit(tx: TransactionRow) {
    setEditing(tx);
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setEditing(null);
  }

  function handleReset() {
    setQ("");
    setType("");
    setCategoryId("");
    setPaymentMethod("");
    setFrom("");
    setTo("");
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Track your income and expenses"
        action={
          // Header add button: visible on large screens and up (hide on md and below)
          <Button onClick={() => setDialogOpen(true)} className="hidden lg:inline-flex">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        }
      />

      <TransactionFilters
        filters={{ q, type, categoryId, paymentMethod, from, to }}
        onChange={(patch) => {
          if ("q" in patch) setQ(patch.q ?? "");
          if ("type" in patch) setType(patch.type ?? "");
          if ("categoryId" in patch) setCategoryId(patch.categoryId ?? "");
          if ("paymentMethod" in patch)
            setPaymentMethod(patch.paymentMethod ?? "");
          if ("from" in patch) setFrom(patch.from ?? "");
          if ("to" in patch) setTo(patch.to ?? "");
          setPage(0);
        }}
        onReset={handleReset}
      />

      <TransactionTable
        data={data?.data ?? []}
        count={data?.count ?? 0}
        pageCount={data?.pageCount ?? 0}
        page={page}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={setDeleting}
        onPageChange={setPage}
      />

      <TransactionDialog
        open={dialogOpen}
        editing={editing}
        onClose={handleCloseDialog}
      />

      <DeleteTransactionDialog
        transaction={deleting}
        onClose={() => setDeleting(null)}
      />

      {/* Floating action button: visible on md and below (hidden on lg and up) */}
      <button
        type="button"
        aria-label="Add Transaction"
        onClick={() => setDialogOpen(true)}
        className="fixed right-4 bottom-4 z-50 inline-flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-lg lg:hidden"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
