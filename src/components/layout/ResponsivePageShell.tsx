import type { ReactNode } from "react"
import { cn } from "#/lib/utils"

type ResponsivePageShellProps = {
  /** Pill label above the title (e.g. "Research feed"). */
  eyebrow: string
  /** Optional accent color for the eyebrow. */
  eyebrowAccent?: "orange" | "blue"
  /** Main title — clamps fluidly across viewports. */
  title: ReactNode
  /** Description below the title. */
  description: ReactNode
  /** Small metadata row, separated by middle-dot. Wraps freely on mobile. */
  meta?: ReactNode
  /** Optional filter rail — scrolls horizontally on mobile with edge fade. */
  filters?: ReactNode
  /** Optional secondary controls row (sort + search). */
  controls?: ReactNode
  /** The main content (grid / list / empty / loading / error). */
  children: ReactNode
  /** Optional footer area (infinite scroll sentinel, "End of list" notice). */
  footer?: ReactNode
  /** Whether to render a full-bleed lab-page background. Default true. */
  withBackground?: boolean
}

/**
 * ResponsivePageShell
 *
 * One layout primitive for `/projects` and `/research`. Keeps the visual
 * rhythm consistent and applies mobile-first responsive rules:
 *
 *  - Hero: `max-w-3xl` content, `text-display-xl` (fluid clamp), tighter
 *    padding on small screens.
 *  - Filter rail: horizontal scroll on mobile with edge-fade mask; wraps
 *    on sm+.
 *  - Controls row: stacks on mobile, side-by-side on sm+.
 *  - Grid: caller-controlled; shell only renders the wrapper + footer.
 *
 * No arbitrary media queries — Tailwind responsive utilities + the
 * tokens in `src/styles.css` handle the rest.
 */
export function ResponsivePageShell({
  eyebrow,
  eyebrowAccent = "orange",
  title,
  description,
  meta,
  filters,
  controls,
  children,
  footer,
  withBackground = true,
}: ResponsivePageShellProps) {
  return (
    <main
      className={cn(
        withBackground && "lab-page-bg",
        "border-t border-[var(--lab-line)] text-[var(--lab-ink)]",
      )}
    >
      <section className="mx-auto w-full max-w-[1240px] px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:pt-28">
        <header className="mx-auto max-w-3xl">
          <p
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.18em]",
              eyebrowAccent === "blue"
                ? "text-[var(--lab-blue)]"
                : "text-[var(--lab-orange)]",
            )}
          >
            {eyebrow}
          </p>
          <h1 className="text-display-xl mt-2 font-semibold text-[var(--lab-ink)]">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--lab-ink-soft)] sm:mt-4 sm:text-base">
            {description}
          </p>
          {meta ? (
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] text-[var(--lab-ink-soft)] sm:mt-6 sm:gap-x-4 sm:text-xs">
              {meta}
            </div>
          ) : null}
        </header>

        <div className="lab-section-divider mt-10 sm:mt-12" />

        {filters ? <div className="mt-8 sm:mt-10">{filters}</div> : null}

        {controls ? (
          <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            {controls}
          </div>
        ) : null}

        <div className="mt-8 sm:mt-10">{children}</div>

        {footer ? <div className="mt-8">{footer}</div> : null}
      </section>
    </main>
  )
}

/**
 * FilterRail — wraps a row of filter pills in a horizontal scroll
 * container on mobile, normal flex on larger screens.
 *
 * `aria-label` describes the region for screen readers; `rail-fade-right`
 * applies a subtle edge mask so users see more exists.
 */
export function FilterRail({
  children,
  ariaLabel,
}: {
  children: ReactNode
  ariaLabel: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0"
    >
      <div className="rail-fade-right flex min-w-max items-center gap-2 pb-1 sm:min-w-0 sm:flex-wrap sm:pb-0">
        {children}
      </div>
    </div>
  )
}

/**
 * MetadataItem — renders a single metadata bullet separated by a
 * mid-dot from its siblings. Keeps the dot a real DOM node so screen
 * readers don't read it as content.
 */
export function MetaItem({ children }: { children: ReactNode }) {
  return <span>{children}</span>
}

export function MetaDot() {
  return (
    <span aria-hidden className="text-[var(--lab-line-strong)]">
      ·
    </span>
  )
}
