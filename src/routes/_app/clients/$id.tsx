import { createFileRoute } from '@tanstack/react-router'
import { ClientDetailPage } from '@/pages/clients/ClientDetailPage'

export const Route = createFileRoute('/_app/clients/$id')({
  component: ClientDetailPage,
})
