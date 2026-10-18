import { cn } from "#/lib/utils"

export type FilterOption = {
  value: string
  label: string
}

type FilterTabsProps = {
  label: string
  options: ReadonlyArray<FilterOption>
  value: string
  onChange: (value: string) => void
  className?: string
}

export function FilterTabs({ label, options, value, onChange, className }: FilterTabsProps) {
  return (
    <nav aria-label={label} className={cn("-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}>
      <ul className="flex min-w-max gap-x-8 border-b border-[var(--lab-line)]">
        {options.map((option) => {
          const active = option.value === value
          return (
            <li key={option.value}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onChange(option.value)}
                className={cn(
                  "-mb-px border-b-2 pb-3 text-[17px] font-medium transition-colors focus-visible:outline-none focus-visible:text-[var(--lab-orange)]",
                  active
                    ? "border-[var(--lab-orange)] text-[var(--lab-ink)]"
                    : "border-transparent text-[var(--lab-ink-soft)] hover:text-[var(--lab-ink)]",
                )}
              >
                {option.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
