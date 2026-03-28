import { createFileRoute } from '@tanstack/react-router'
import { InvoiceViewPage } from '@/pages/invoices/InvoiceViewPage'

export const Route = createFileRoute('/_app/invoices/$id')({
  component: InvoiceViewPage,
})
