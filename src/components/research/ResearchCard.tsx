import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Clock } from "lucide-react"
import { motion } from "motion/react"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { cn } from "#/lib/utils"

export type ResearchCardItem = {
  id: string
  title: string
  slug: string
  excerpt: string
  category: { name: string; slug: string } | null
  publishedAt: Date | string | null
  readingTime: number | null
  author?: { name: string } | null
  tags?: Array<{ slug: string; name: string }>
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return ""
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date)
}

type ResearchCardProps = {
  article: ResearchCardItem
  href?: string
  variant?: "default" | "featured"
  className?: string
  children?: ReactNode
}

export function ResearchCard({
  article,
  href,
  variant = "default",
  className,
  children,
}: ResearchCardProps) {
  const target = href ?? `/research/${article.slug}`
  const isFeatured = variant === "featured"
  const tags = (article.tags ?? []).slice(0, 3)

  return (
    <Link
      to={target}
      className="group block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lab-bg)]"
    >
      <motion.article
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_OPTIONS}
        variants={fadeInUp}
        className={cn(
          "research-card-surface relative flex h-full min-h-[260px] flex-col overflow-hidden p-6 transition-all duration-300",
          "sm:p-7",
          "hover:-translate-y-0.5 hover:border-[var(--lab-blue)]/30 hover:shadow-[0_18px_48px_-28px_rgba(56,130,255,0.45)]",
          isFeatured && "p-7 sm:p-8",
          className,
        )}
      >
        {/* Accent line on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-[var(--lab-blue)] to-transparent opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100"
        />

        {children ?? (
          <>
            <header className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-[var(--lab-blue)]/30 bg-[var(--lab-blue)]/8 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--lab-blue)]">
                  {article.category?.name ?? "Research"}
                </span>
                {tags.length > 0
                  ? tags.map((tag) => (
                      <span
                        key={tag.slug}
                        className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)] sm:inline"
                      >
                        #{tag.slug}
                      </span>
                    ))
                  : null}
              </div>
              <ArrowUpRight
                aria-hidden
                className="size-4 shrink-0 text-[var(--lab-ink-soft)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--lab-orange)]"
              />
            </header>

            <div className="mt-5 flex-1">
              <h3
                className={cn(
                  "font-semibold leading-[1.2] tracking-tight text-[var(--lab-ink)] transition-colors group-hover:text-[var(--lab-orange)]",
                  isFeatured ? "text-2xl sm:text-[26px]" : "text-lg sm:text-xl",
                )}
              >
                {article.title}
              </h3>
              <p
                className={cn(
                  "mt-2 leading-relaxed text-[var(--lab-ink-soft)]",
                  isFeatured ? "text-[15px]" : "text-sm",
                )}
              >
                {article.excerpt}
              </p>
            </div>

            <footer className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-[var(--lab-ink-soft)]">
              {article.publishedAt ? (
                <time dateTime={new Date(article.publishedAt).toISOString()}>
                  {formatDate(article.publishedAt)}
                </time>
              ) : null}
              {article.publishedAt && article.readingTime ? (
                <span aria-hidden className="text-[var(--lab-line-strong)]">
                  ·
                </span>
              ) : null}
              {article.readingTime ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" aria-hidden />
                  {article.readingTime} min
                </span>
              ) : null}
              {article.author?.name ? (
                <>
                  <span aria-hidden className="text-[var(--lab-line-strong)]">
                    ·
                  </span>
                  <span>by {article.author.name}</span>
                </>
              ) : null}
            </footer>
          </>
        )}
      </motion.article>
    </Link>
  )
}
