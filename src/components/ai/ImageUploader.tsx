import { useState } from "react"
import { useDropzone } from "@uploadthing/react"
import { Upload, X } from "lucide-react"
import { cn } from "#/lib/utils"

type UploadPurpose = "research-cover" | "brief-attachment" | "team-avatar"

export function ImageUploader({
  value,
  onChange,
  label,
  purpose = "research-cover",
  className,
}: {
  value?: string | null
  onChange: (url: string | null) => void
  label?: string
  purpose?: UploadPurpose
  className?: string
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return
      const file = acceptedFiles[0]
      if (!file) return
      setIsUploading(true)
      setError(null)
      try {
        const form = new FormData()
        form.append("file", file, file.name)
        form.append("purpose", purpose)
        const response = await fetch("/api/upload", {
          method: "POST",
          body: form,
          credentials: "include",
        })
        const data = (await response.json()) as
          | { ok: true; data: { url: string } }
          | { ok: false; error: { message: string } }
        if (!data.ok) {
          setError(data.error.message)
          return
        }
        onChange(data.data.url)
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed.")
      } finally {
        setIsUploading(false)
      }
    },
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".avif"] },
    multiple: false,
  })

  if (value) {
    return (
      <figure
        className={cn(
          "overflow-hidden border border-[var(--lab-line)] bg-[var(--lab-card)]",
          className,
        )}
      >
        <img
          src={value}
          alt={label ?? "Uploaded image"}
          className="aspect-[16/9] w-full object-cover"
        />
        <figcaption className="flex items-center justify-between gap-3 border-t border-[var(--lab-line)] px-3 py-2 text-xs text-[var(--lab-ink-soft)]">
          <span className="truncate font-mono">{label ?? "Cover image"}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 text-[var(--lab-orange)] transition-opacity hover:opacity-80"
          >
            <X className="size-3" aria-hidden />
            Remove
          </button>
        </figcaption>
      </figure>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-[var(--lab-line)] bg-[var(--lab-card)] px-4 py-8 text-center transition-colors",
        isDragActive && "border-[var(--lab-orange)] bg-[var(--lab-orange-soft)]",
        className,
      )}
    >
      <input {...getInputProps()} />
      <Upload className="size-5 text-[var(--lab-orange)]" aria-hidden />
      <p className="text-sm text-[var(--lab-ink)]">
        {isUploading ? "Uploading…" : isDragActive ? "Drop image here" : "Drop image or click to upload"}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
        PNG · JPG · WEBP · up to 8 MB
      </p>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
