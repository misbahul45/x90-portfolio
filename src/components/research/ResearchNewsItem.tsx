import { Link } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import { formatMonthYear } from "#/lib/format-date"
import { cn } from "#/lib/utils"

export type ResearchNewsItemData = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: { name: string; slug: string } | null
  publishedAt: Date | string | null
}

type ResearchNewsItemProps = {
  article: ResearchNewsItemData
  showExcerpt?: boolean
  className?: string
}

export function ResearchNewsItem({ article, showExcerpt = false, className }: ResearchNewsItemProps) {
  const dateLabel = formatMonthYear(article.publishedAt)
  const meta = [dateLabel, article.category?.name].filter(Boolean).join("  ·  ")

  return (
    <Link
      to="/research/$slug"
      params={{ slug: article.slug }}
      className={cn(
        "group flex h-full flex-col justify-between gap-10 rounded-3xl border border-[var(--lab-line)] bg-[var(--lab-card)] p-7 no-underline transition-colors hover:border-[var(--lab-line-strong)] hover:bg-[var(--lab-card-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)]",
        className,
      )}
    >
      <div>
        <h3 className="dm-card-title">{article.title}</h3>
        {showExcerpt && article.excerpt ? (
          <p className="dm-body mt-3 line-clamp-3">{article.excerpt}</p>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-4">
        <p className="text-sm text-[var(--lab-ink-soft)]">{meta}</p>
        <ChevronRight
          className="size-5 shrink-0 text-[var(--lab-ink-soft)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--lab-orange)]"
          aria-hidden
        />
      </div>
    </Link>
  )
}
