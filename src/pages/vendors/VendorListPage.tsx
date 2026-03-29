import { useState } from 'react'
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs'
import { Plus, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { VendorFilters } from './components/VendorFilters'
import { VendorCard } from './components/VendorCard'
import { VendorDialog } from './components/VendorDialog'
import { DeleteVendorDialog } from './components/DeleteVendorDialog'
import { useVendors } from './hooks/useVendors'
import type { VendorRow } from './hooks/useVendors'

export function VendorListPage() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''))
  const [categoryId, setCategoryId] = useQueryState('category', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<VendorRow | null>(null)
  const [deleting, setDeleting] = useState<VendorRow | null>(null)

  const { data, isLoading } = useVendors({ q, categoryId, page })

  function handleEdit(v: VendorRow) {
    setEditing(v)
    setDialogOpen(true)
  }

  function handleCloseDialog() {
    setDialogOpen(false)
    setEditing(null)
  }

  function handleReset() {
    setQ('')
    setCategoryId('')
    setPage(0)
  }

  const isEmpty = !isLoading && (data?.count ?? 0) === 0 && !q && !categoryId

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage suppliers and service providers"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        }
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <VendorFilters
          q={q}
          categoryId={categoryId}
          onSearch={(v) => { setQ(v); setPage(0) }}
          onCategory={(v) => { setCategoryId(v); setPage(0) }}
          onReset={handleReset}
        />
        {!isLoading && (data?.count ?? 0) > 0 && (
          <p className="text-sm text-muted-foreground">
            {data?.count} vendor{data?.count !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium mb-1">No vendors yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add vendors to track your business expenses</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-px w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))
              : data?.data.map(v => (
                  <VendorCard key={v.id} vendor={v} onEdit={handleEdit} onDelete={setDeleting} />
                ))
            }
          </div>

          {(data?.pageCount ?? 0) > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page + 1} of {data?.pageCount}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= (data?.pageCount ?? 1) - 1} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <VendorDialog open={dialogOpen} editing={editing} onClose={handleCloseDialog} />
      <DeleteVendorDialog vendor={deleting} onClose={() => setDeleting(null)} />
    </div>
  )
}
