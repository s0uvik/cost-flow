import { useState } from 'react'
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { TransactionFilters } from './components/TransactionFilters'
import { TransactionTable } from './components/TransactionTable'
import { TransactionDialog } from './components/TransactionDialog'
import { DeleteTransactionDialog } from './components/DeleteTransactionDialog'
import { useTransactions } from './hooks/useTransactions'
import type { TransactionRow } from './hooks/useTransactions'

export function TransactionListPage() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''))
  const [type, setType] = useQueryState('type', parseAsString.withDefault(''))
  const [categoryId, setCategoryId] = useQueryState('category', parseAsString.withDefault(''))
  const [from, setFrom] = useQueryState('from', parseAsString.withDefault(''))
  const [to, setTo] = useQueryState('to', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TransactionRow | null>(null)
  const [deleting, setDeleting] = useState<TransactionRow | null>(null)

  const { data, isLoading } = useTransactions({ q, type: type as '' | 'income' | 'expense', categoryId, from, to, page })

  function handleEdit(tx: TransactionRow) {
    setEditing(tx)
    setDialogOpen(true)
  }

  function handleCloseDialog() {
    setDialogOpen(false)
    setEditing(null)
  }

  function handleReset() {
    setQ('')
    setType('')
    setCategoryId('')
    setFrom('')
    setTo('')
    setPage(0)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Track your income and expenses"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        }
      />

      <TransactionFilters
        filters={{ q, type, categoryId, from, to }}
        onChange={(patch) => {
          if ('q' in patch) setQ(patch.q ?? '')
          if ('type' in patch) setType(patch.type ?? '')
          if ('categoryId' in patch) setCategoryId(patch.categoryId ?? '')
          if ('from' in patch) setFrom(patch.from ?? '')
          if ('to' in patch) setTo(patch.to ?? '')
          setPage(0)
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
    </div>
  )
}
