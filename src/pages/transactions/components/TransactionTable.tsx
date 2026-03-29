import { format } from "date-fns";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Banknote,
  CreditCard,
  MoreVertical,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TransactionRow } from "../hooks/useTransactions";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

type Props = {
  data: TransactionRow[];
  count: number;
  pageCount: number;
  page: number;
  isLoading: boolean;
  onEdit: (tx: TransactionRow) => void;
  onDelete: (tx: TransactionRow) => void;
  onPageChange: (page: number) => void;
};

export function TransactionTable({
  data,
  count,
  pageCount,
  page,
  isLoading,
  onEdit,
  onDelete,
  onPageChange,
}: Props) {
  // Compute running balance across the current page (most recent first, so reverse for calc)
  const balances: number[] = [];
  let running = 0;
  const reversed = [...data].reverse();
  for (const tx of reversed) {
    running += tx.type === "income" ? tx.amount : -tx.amount;
    balances.unshift(running);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Account Details</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-10 text-muted-foreground"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              data.map((tx, i) => {
                const isIncome = tx.type === "income";
                const cat = tx.categories;
                const balance = balances[i];
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(tx.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      {cat ? (
                        <Badge
                          variant="secondary"
                          className="gap-1.5"
                          style={{
                            backgroundColor: cat.color + "22",
                            color: cat.color,
                          }}
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isIncome ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tx.payment_method === "account" ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
                          <CreditCard className="h-3.5 w-3.5" />
                          Account
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Banknote className="h-3.5 w-3.5" />
                          Cash
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.payment_reference ? (
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                          {tx.payment_reference}
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${isIncome ? "text-green-600" : "text-red-600"}`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatINR(tx.amount)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatINR(balance)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(tx)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(tx)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
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

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {count} transaction{count !== 1 ? "s" : ""}
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
