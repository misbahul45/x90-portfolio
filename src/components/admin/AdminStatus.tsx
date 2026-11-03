import { cn } from "#/lib/utils"

export type AdminStatusTone = "active" | "neutral" | "danger"

const DOT_CLASS: Record<AdminStatusTone, string> = {
  active: "bg-[var(--lab-orange)]",
  neutral: "border border-[var(--lab-line-strong)]",
  danger: "bg-destructive",
}

type AdminStatusProps = {
  label: string
  tone?: AdminStatusTone
  className?: string
}

export function AdminStatus({ label, tone = "neutral", className }: AdminStatusProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-[var(--lab-ink)]", className)}>
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT_CLASS[tone])} />
      {label}
    </span>
  )
}
