import { useState } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { Plus, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFilters } from "./components/ClientFilters";
import { ClientCard } from "./components/ClientCard";
import { ClientDialog } from "./components/ClientDialog";
import { DeleteClientDialog } from "./components/DeleteClientDialog";
import { useClients } from "./hooks/useClients";
import type { ClientRow } from "./hooks/useClients";

export function ClientListPage() {
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [deleting, setDeleting] = useState<ClientRow | null>(null);

  const { data, isLoading } = useClients({ q, page });

  function handleEdit(c: ClientRow) {
    setEditing(c);
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setEditing(null);
  }

  const isEmpty = !isLoading && (data?.count ?? 0) === 0 && !q;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage your clients and their invoices"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <ClientFilters
          q={q}
          onChange={(v) => {
            setQ(v);
            setPage(0);
          }}
          onReset={() => {
            setQ("");
            setPage(0);
          }}
        />
        {!isLoading && (data?.count ?? 0) > 0 && (
          <p className="text-sm text-muted-foreground">
            {data?.count} client{data?.count !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium mb-1">No clients yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first client to start creating invoices
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-px w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))
              : data?.data.map((c) => (
                  <ClientCard
                    key={c.id}
                    client={c}
                    onEdit={handleEdit}
                    onDelete={setDeleting}
                  />
                ))}
          </div>

          {(data?.pageCount ?? 0) > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {data?.pageCount}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= (data?.pageCount ?? 1) - 1}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <ClientDialog
        open={dialogOpen}
        editing={editing}
        onClose={handleCloseDialog}
      />
      <DeleteClientDialog client={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}
