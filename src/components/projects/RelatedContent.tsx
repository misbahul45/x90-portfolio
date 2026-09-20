import { Link } from "@tanstack/react-router"
import { ArrowUpRight, FlaskConical, FolderGit2 } from "lucide-react"

type ProjectRelated = {
  id: string
  slug: string
  title: string
  description: string
  category: { id: string; slug: string; name: string } | null
}

type ArticleRelated = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: { id: string; slug: string; name: string } | null
  publishedAt?: string | Date | null
  readingTime?: number | null
}

type RelatedProjectsProps = {
  title?: string
  viewAllHref?: string
  viewAllLabel?: string
  items: ProjectRelated[]
}

export function RelatedProjects({ title = "Related systems", viewAllHref, viewAllLabel, items }: RelatedProjectsProps) {
  if (items.length === 0) return null
  return (
    <section className="border-t border-[var(--lab-line)] bg-[var(--lab-bg-soft)] py-16">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
              Related
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-3xl">
              {title}
            </h2>
          </div>
          {viewAllHref ? (
            <Link
              to={viewAllHref}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
            >
              {viewAllLabel ?? "View all"}
              <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          ) : null}
        </header>
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to="/projects/$slug"
                params={{ slug: item.slug }}
                className="research-card-surface group block h-full p-6 no-underline"
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
                    <FolderGit2 className="mr-1.5 inline-block size-3 -translate-y-px" aria-hidden />
                    {item.category?.name ?? "System"}
                  </p>
                  <ArrowUpRight
                    className="size-4 text-[var(--lab-ink-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--lab-orange)]"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-[var(--lab-ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                  {item.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

type RelatedArticlesProps = {
  title?: string
  caption?: string
  viewAllHref?: string
  viewAllLabel?: string
  items: ArticleRelated[]
}

export function RelatedArticles({
  title = "Related research",
  caption,
  viewAllHref,
  viewAllLabel,
  items,
}: RelatedArticlesProps) {
  if (items.length === 0) return null
  return (
    <section className="border-t border-[var(--lab-line)] bg-[var(--lab-bg-soft)] py-16">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
              <FlaskConical className="mr-1.5 inline-block size-3 -translate-y-px" aria-hidden />
              Research
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-3xl">
              {title}
            </h2>
            {caption ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                {caption}
              </p>
            ) : null}
          </div>
          {viewAllHref ? (
            <Link
              to={viewAllHref}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
            >
              {viewAllLabel ?? "View all research"}
              <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          ) : null}
        </header>
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to="/research/$slug"
                params={{ slug: item.slug }}
                className="research-card-surface group block h-full p-6 no-underline"
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
                    {item.category?.name ?? "Research"}
                  </p>
                  <ArrowUpRight
                    className="size-4 text-[var(--lab-ink-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--lab-orange)]"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-[var(--lab-ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                  {item.excerpt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
