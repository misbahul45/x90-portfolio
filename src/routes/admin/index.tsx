import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import {
  FileText,
  FolderGit2,
  Users,
  Inbox,
  Plus,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react"
import { useAdminArticles } from "#/hooks/useAdminArticles"
import { useAdminProjects } from "#/hooks/useAdminProjects"
import { useAdminTeam } from "#/hooks/useAdminTeam"
import { useAdminFeedback } from "#/hooks/useAdminFeedback"
import { Skeleton } from "#/components/ui/skeleton"
import { fadeInUp, staggerContainer, staggerItem, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { Link } from "@tanstack/react-router"
import { ARTICLE_STATUS, type ArticleStatus } from "#/lib/domain/article-status"
import { FEEDBACK_STATUS } from "#/lib/domain/feedback"

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — XNINETZY Labs" }] }),
  component: AdminDashboard,
})

type ArticleListItem = {
  id: string
  title: string
  status: ArticleStatus
}

type FeedbackItem = {
  id: string
  message: string
  name: string
}

type MetricCard = {
  label: string
  value: number | string
  hint: string
  icon: LucideIcon
  to: string
  meta?: { label: string; value: number | string }
}

function AdminDashboard() {
  const { data: articles, isPending: articlesPending } = useAdminArticles()
  const { data: projects, isPending: projectsPending } = useAdminProjects()
  const { data: team, isPending: teamPending } = useAdminTeam()
  const { data: feedback, isPending: feedbackPending } = useAdminFeedback({
    status: FEEDBACK_STATUS.NEW,
  })

  const published =
    articles?.filter((article: ArticleListItem) => article.status === ARTICLE_STATUS.PUBLISHED).length ?? 0
  const drafts =
    articles?.filter((article: ArticleListItem) => article.status === ARTICLE_STATUS.DRAFT).length ?? 0

  const metrics: MetricCard[] = [
    {
      label: "Articles",
      value: published,
      hint: "published",
      icon: FileText,
      to: "/admin/articles",
      meta: { label: "drafts", value: drafts },
    },
    {
      label: "Projects",
      value: projects?.length ?? 0,
      hint: "total",
      icon: FolderGit2,
      to: "/admin/projects",
    },
    {
      label: "Team",
      value: team?.length ?? 0,
      hint: "members",
      icon: Users,
      to: "/admin/team",
    },
    {
      label: "Feedback",
      value: feedback?.length ?? 0,
      hint: "new",
      icon: Inbox,
      to: "/admin/feedback",
    },
  ]

  const articlesTyped: ArticleListItem[] = (articles ?? []) as ArticleListItem[]
  const feedbackTyped: FeedbackItem[] = (feedback ?? []) as FeedbackItem[]

  const recent = [
    ...articlesTyped.slice(0, 4).map((article) => ({
      kind: "article" as const,
      id: article.id,
      title: article.title,
      meta: article.status === ARTICLE_STATUS.DRAFT ? "Draft" : "Published",
      href: `/admin/articles/${article.id}`,
    })),
    ...feedbackTyped.slice(0, 3).map((item) => ({
      kind: "feedback" as const,
      id: item.id,
      title: item.message,
      meta: item.name,
      href: "/admin/feedback",
    })),
  ].slice(0, 6)

  return (
    <div className="space-y-10">
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--lab-ink)]">
          Workspace snapshot
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--lab-ink-soft)]">
          Quick view of published content, projects, team, and incoming signals.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon
          const isPending =
            (metric.label === "Articles" && articlesPending) ||
            (metric.label === "Projects" && projectsPending) ||
            (metric.label === "Team" && teamPending) ||
            (metric.label === "Feedback" && feedbackPending)
          return (
            <motion.div key={metric.label} variants={staggerItem}>
              <Link
                to={metric.to}
                className="research-card-surface group block p-5 no-underline transition-transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--lab-orange-soft)] text-[var(--lab-orange)]">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <ArrowUpRight
                    className="size-4 text-[var(--lab-ink-soft)] transition-colors group-hover:text-[var(--lab-orange)]"
                    aria-hidden
                  />
                </div>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
                  {metric.label}
                </p>
                {isPending ? (
                  <Skeleton className="mt-2 h-9 w-20" />
                ) : (
                  <p className="mt-1 font-mono text-3xl font-semibold tracking-tight text-[var(--lab-ink)]">
                    {metric.value}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 font-mono text-[11px] text-[var(--lab-ink-soft)]">
                  <span>{metric.hint}</span>
                  {metric.meta ? (
                    <>
                      <span aria-hidden className="text-[var(--lab-line-strong)]">·</span>
                      <span>
                        {metric.meta.value} {metric.meta.label}
                      </span>
                    </>
                  ) : null}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_OPTIONS}
        variants={fadeInUp}
      >
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--lab-ink)]">
            Recent activity
          </h2>
          <Link
            to="/admin/articles"
            className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
          >
            Open Research
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </header>
        <ul className="mt-4 divide-y divide-[var(--lab-line)] rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)]">
          {recent.length === 0 ? (
            <li className="p-6 text-center text-sm text-[var(--lab-ink-soft)]">
              No activity yet.
            </li>
          ) : (
            recent.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <Link
                  to={item.href}
                  className="flex items-center justify-between gap-3 px-4 py-3 no-underline transition-colors hover:bg-[var(--lab-card-elevated)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="lab-tech-tag shrink-0">
                      {item.kind}
                    </span>
                    <span className="truncate text-sm text-[var(--lab-ink)]">{item.title}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--lab-ink-soft)]">{item.meta}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_OPTIONS}
        variants={fadeInUp}
        className="rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)] p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--lab-ink)]">
              Start a new article
            </h2>
            <p className="mt-1 text-sm text-[var(--lab-ink-soft)]">
              Compose a Tiptap document and publish when ready.
            </p>
          </div>
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--lab-orange)] px-4 py-2 font-mono text-sm font-semibold text-[var(--lab-bg)] no-underline transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" aria-hidden />
            New article
          </Link>
        </div>
      </motion.section>
    </div>
  )
}
