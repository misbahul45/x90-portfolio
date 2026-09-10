import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
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
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return ""
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date)
}

type ResearchCardProps = {
  article: ResearchCardItem
  href?: string
  className?: string
  children?: ReactNode
}

export function ResearchCard({ article, href, className, children }: ResearchCardProps) {
  const target = href ?? `/research/${article.slug}`
  return (
    <Link
      to={target}
      className="block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lab-bg)]"
    >
      <motion.article
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_OPTIONS}
        variants={fadeInUp}
        className={cn(
          "research-card-surface group relative flex h-full min-h-[260px] flex-col p-6 sm:p-7",
          className,
        )}
      >
        {children ?? (
          <>
            <header className="flex items-start justify-between gap-3">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--lab-blue)]">
                {article.category?.name ?? "Research"}
              </p>
              <ArrowUpRight
                aria-hidden
                className="size-4 shrink-0 text-[var(--lab-ink-soft)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--lab-orange)]"
              />
            </header>

            <div className="mt-5 flex-1">
              <h3 className="text-lg font-semibold leading-snug tracking-tight text-[var(--lab-ink)] sm:text-xl">
                {article.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                {article.excerpt}
              </p>
            </div>

            <footer className="mt-5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[var(--lab-ink-soft)]">
              <time dateTime={article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined}>
                {formatDate(article.publishedAt)}
              </time>
              {article.readingTime ? (
                <>
                  <span aria-hidden className="text-[var(--lab-line-strong)]">·</span>
                  <span>{article.readingTime} min read</span>
                </>
              ) : null}
            </footer>
          </>
        )}
      </motion.article>
    </Link>
  )
}
