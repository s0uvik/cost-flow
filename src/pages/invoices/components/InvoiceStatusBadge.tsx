import { Badge } from '@/components/ui/badge'
import type { InvoiceStatus } from '../hooks/useInvoices'

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-slate-100 text-slate-700 border-slate-200' },
  sent:      { label: 'Sent',      className: 'bg-blue-50 text-blue-700 border-blue-200' },
  paid:      { label: 'Paid',      className: 'bg-green-50 text-green-700 border-green-200' },
  overdue:   { label: 'Overdue',   className: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', className: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
}

type Props = { status: InvoiceStatus }

export function InvoiceStatusBadge({ status }: Props) {
  const cfg = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}
