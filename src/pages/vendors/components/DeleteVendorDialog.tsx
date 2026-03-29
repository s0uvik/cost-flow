import { Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteVendor } from '../hooks/useVendorMutations'
import type { VendorRow } from '../hooks/useVendors'

type Props = {
  vendor: VendorRow | null
  onClose: () => void
}

export function DeleteVendorDialog({ vendor, onClose }: Props) {
  const deleteMutation = useDeleteVendor()

  async function handleDelete() {
    if (!vendor) return
    await deleteMutation.mutateAsync(vendor.id)
    onClose()
  }

  return (
    <Dialog open={!!vendor} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Vendor</DialogTitle>
          <DialogDescription>
            Delete <span className="font-medium text-foreground">"{vendor?.name}"</span>?{' '}
            {(vendor?.transaction_count ?? 0) > 0 && (
              <span className="text-amber-600 font-medium">
                {vendor?.transaction_count} transaction{vendor?.transaction_count !== 1 ? 's' : ''} linked to this vendor will be unlinked.{' '}
              </span>
            )}
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
