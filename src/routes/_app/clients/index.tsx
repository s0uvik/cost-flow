import { createFileRoute } from '@tanstack/react-router'
import { ClientListPage } from '@/pages/clients/ClientListPage'

export const Route = createFileRoute('/_app/clients/')({
  component: ClientListPage,
})
