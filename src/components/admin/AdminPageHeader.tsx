import type { ReactNode } from "react"

type AdminPageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="dm-title">{title}</h1>
        {description ? <p className="dm-subtitle mt-1">{description}</p> : null}
      </div>
      {action}
    </header>
  )
}
