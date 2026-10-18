import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { NodeArt } from "#/components/deepmind/NodeArt"
import { formatMonthYear } from "#/lib/format-date"
import type { ResearchNewsItemData } from "#/components/research/ResearchNewsItem"

type ResearchFeatureCardProps = {
  article: ResearchNewsItemData & { coverImage?: string | null }
}

export function ResearchFeatureCard({ article }: ResearchFeatureCardProps) {
  const meta = [formatMonthYear(article.publishedAt), article.category?.name].filter(Boolean).join("  ·  ")

  return (
    <Link
      to="/research/$slug"
      params={{ slug: article.slug }}
      draggable={false}
      className="group block rounded-[1.5rem] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--lab-bg)]"
    >
      <div className="dm-media aspect-[16/9] transition-colors duration-300 group-hover:border-[var(--lab-line-strong)]">
        <div data-slide-parallax className="absolute inset-0">
          {article.coverImage ? (
            <img src={article.coverImage} alt="" draggable={false} className="h-full w-full object-cover" />
          ) : (
            <NodeArt seed={article.slug} />
          )}
        </div>
      </div>
      <div className="mt-5">
        <h3 className="dm-card-title">{article.title}</h3>
        <p className="dm-body mt-2 line-clamp-3">{article.excerpt}</p>
      </div>
      <p className="mt-4 flex items-center justify-between gap-4 text-sm text-[var(--lab-ink-soft)]">
        <span>{meta}</span>
        <span className="inline-flex items-center gap-1 font-medium text-[var(--lab-ink)] transition-colors group-hover:text-[var(--lab-orange)]">
          Read
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </p>
    </Link>
  )
}
