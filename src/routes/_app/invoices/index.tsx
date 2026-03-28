import { createFileRoute } from '@tanstack/react-router'
import { InvoiceListPage } from '@/pages/invoices/InvoiceListPage'

export const Route = createFileRoute('/_app/invoices/')({
  component: InvoiceListPage,
})
