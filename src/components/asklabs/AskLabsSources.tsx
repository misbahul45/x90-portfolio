import { Link } from "@tanstack/react-router"
import { ArrowUpRight, BookOpen, FolderGit2 } from "lucide-react"
import type { AskLabsSource } from "#/lib/ask-labs"

export function AskLabsSources({ sources }: { sources: AskLabsSource[] }) {
  if (sources.length === 0) return null
  return (
    <aside className="border-l border-[var(--lab-orange)]/40 bg-[var(--lab-card)]/60 px-3 py-2">
      <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--lab-ink)]">
        <BookOpen className="size-3.5 text-[var(--lab-orange)]" aria-hidden />
        Sources
      </p>
      <ul className="mt-1.5 flex flex-col gap-1.5">
        {sources.map((source) => (
          <li key={`${source.kind}:${source.id}`}>
            <Link
              to={source.kind === "project" ? "/projects/$slug" : "/research/$slug"}
              params={{ slug: source.slug }}
              className="group flex items-start gap-2 text-sm leading-snug text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
            >
              {source.kind === "project" ? (
                <FolderGit2 className="mt-0.5 size-3 shrink-0 text-[var(--lab-orange)]" aria-hidden />
              ) : (
                <BookOpen className="mt-0.5 size-3 shrink-0 text-[var(--lab-orange)]" aria-hidden />
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium text-[var(--lab-ink)] group-hover:text-[var(--lab-orange)]">
                  {source.title}
                </span>
                {source.reason ? (
                  <span className="block text-xs text-[var(--lab-ink-soft)]">{source.reason}</span>
                ) : source.excerpt ? (
                  <span className="block truncate text-xs text-[var(--lab-ink-soft)]">{source.excerpt}</span>
                ) : null}
              </span>
              <ArrowUpRight
                className="ml-auto size-3 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
