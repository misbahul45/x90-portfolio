import type { ComponentPropsWithoutRef } from "react"
import { cn } from "#/lib/utils"

type FilterPillProps = Omit<ComponentPropsWithoutRef<"button">, "data-active"> & {
  active: boolean
  count?: number
}

export function FilterPill({ active, count, className, children, ...rest }: FilterPillProps) {
  return (
    <button
      type="button"
      data-active={active}
      aria-pressed={active}
      className={cn("lab-filter-pill", className)}
      {...rest}
    >
      <span>{children}</span>
      {typeof count === "number" && (
        <span className="text-[10px] opacity-70">{count}</span>
      )}
    </button>
  )
}
