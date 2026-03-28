import { createFileRoute } from '@tanstack/react-router'
import { TransactionListPage } from '@/pages/transactions/TransactionListPage'

export const Route = createFileRoute('/_app/transactions/')({
  component: TransactionListPage,
})
