import { format } from 'date-fns'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { TransactionRow } from '../hooks/useTransactions'

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
}

type Props = {
  data: TransactionRow[]
  count: number
  pageCount: number
  page: number
  isLoading: boolean
  onEdit: (tx: TransactionRow) => void
  onDelete: (tx: TransactionRow) => void
  onPageChange: (page: number) => void
}

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
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              data.map((tx) => {
                const isIncome = tx.type === 'income'
                const cat = tx.categories
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(tx.date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>
                      {cat ? (
                        <Badge
                          variant="secondary"
                          className="gap-1.5"
                          style={{ backgroundColor: cat.color + '22', color: cat.color }}
                        >
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isIncome ? 'default' : 'destructive'} className="capitalize">
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'}{formatINR(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(tx)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onDelete(tx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{count} transaction{count !== 1 ? 's' : ''}</span>
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
            <span>Page {page + 1} of {pageCount}</span>
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
  )
}
