import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadLogo, useUpdateProfile } from '../hooks/useProfile'

type Props = {
  currentUrl: string | null
  businessName: string
}

export function LogoUpload({ currentUrl, businessName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const uploadMutation = useUploadLogo()
  const updateProfile = useUpdateProfile()

  const displayUrl = preview ?? currentUrl

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file))
    const publicUrl = await uploadMutation.mutateAsync(file)
    await updateProfile.mutateAsync({ logo_url: publicUrl })
    setPreview(null)
  }

  async function handleRemove() {
    await updateProfile.mutateAsync({ logo_url: null })
    setPreview(null)
  }

  const isPending = uploadMutation.isPending || updateProfile.isPending

  return (
    <div className="flex items-center gap-4">
      <div className="size-20 rounded-xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/30">
        {isPending ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : displayUrl ? (
          <img src={displayUrl} alt="Logo" className="size-full object-contain p-1" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold text-muted-foreground">
              {businessName?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Business Logo</p>
        <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB. Appears on invoices.</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="mr-1.5 h-3.5 w-3.5" />
            {currentUrl || preview ? 'Change' : 'Upload'}
          </Button>
          {(currentUrl || preview) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
