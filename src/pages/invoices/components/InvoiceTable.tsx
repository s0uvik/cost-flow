import { format, isPast, parseISO } from "date-fns";
import {
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { useUpdateInvoiceStatus } from "../hooks/useInvoiceMutations";
import type { InvoiceRow, InvoiceStatus } from "../hooks/useInvoices";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
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

type Props = {
  data: InvoiceRow[];
  count: number;
  pageCount: number;
  page: number;
  isLoading: boolean;
  onDelete: (inv: InvoiceRow) => void;
  onPageChange: (p: number) => void;
};

export function InvoiceTable({
  data,
  count,
  pageCount,
  page,
  isLoading,
  onDelete,
  onPageChange,
}: Props) {
  const navigate = useNavigate();
  const statusMutation = useUpdateInvoiceStatus();

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              data.map((inv) => {
                const client = inv.clients;
                const isDueOverdue =
                  inv.status === "sent" && isPast(parseISO(inv.due_date));
                return (
                  <TableRow
                    key={inv.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigate({ to: "/invoices/$id", params: { id: inv.id } })
                    }
                  >
                    <TableCell className="font-mono font-medium">
                      {inv.invoice_number}
                    </TableCell>
                    <TableCell>
                      {client ? (
                        <div>
                          <p className="font-medium text-sm">{client.name}</p>
                          {client.company && (
                            <p className="text-xs text-muted-foreground">
                              {client.company}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(parseISO(inv.issue_date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell
                      className={`text-sm ${isDueOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}
                    >
                      {format(parseISO(inv.due_date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatINR(inv.total)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({
                                to: "/invoices/$id",
                                params: { id: inv.id },
                              })
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>

                          {NEXT_STATUSES[inv.status]?.map((s) => (
                            <DropdownMenuItem
                              key={s.value}
                              onClick={() =>
                                statusMutation.mutate({
                                  id: inv.id,
                                  status: s.value,
                                })
                              }
                            >
                              {s.label}
                            </DropdownMenuItem>
                          ))}

                          {(inv.status === "draft" ||
                            inv.status === "cancelled") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onDelete(inv)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            {count} invoice{count !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {page + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= pageCount - 1}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
