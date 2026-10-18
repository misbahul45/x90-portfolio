import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowUpRight, ChevronRight, Plus } from "lucide-react"
import { adminOutlineClass } from "#/components/admin/styles"
import { Button } from "#/components/ui/button"
import { Skeleton } from "#/components/ui/skeleton"
import { useAdminArticles } from "#/hooks/useAdminArticles"
import { useAdminExperiments } from "#/hooks/useAdminExperiments"
import { useAdminFeedback } from "#/hooks/useAdminFeedback"
import { useAdminProjects } from "#/hooks/useAdminProjects"
import { useAdminTeam } from "#/hooks/useAdminTeam"
import { ARTICLE_STATUS, type ArticleStatus } from "#/lib/domain/article-status"
import { FEEDBACK_STATUS } from "#/lib/domain/feedback"

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — X90 Labs" }] }),
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

type Metric = {
  label: string
  value: number
  hint: string
  to: string
  pending: boolean
}

function AdminDashboard() {
  const { data: articles, isPending: articlesPending } = useAdminArticles()
  const { data: projects, isPending: projectsPending } = useAdminProjects()
  const { data: team, isPending: teamPending } = useAdminTeam()
  const { data: experiments, isPending: experimentsPending } = useAdminExperiments()
  const { data: feedback, isPending: feedbackPending } = useAdminFeedback({
    status: FEEDBACK_STATUS.NEW,
  })

  const articleList = (articles ?? []) as ArticleListItem[]
  const feedbackList = (feedback ?? []) as FeedbackItem[]
  const published = articleList.filter((article) => article.status === ARTICLE_STATUS.PUBLISHED).length
  const drafts = articleList.filter((article) => article.status === ARTICLE_STATUS.DRAFT).length
  const running = (experiments ?? []).filter(
    (experiment) => experiment.status === "RUNNING" || experiment.status === "EVALUATING",
  ).length

  const metrics: Metric[] = [
    { label: "Research", value: published, hint: `${drafts} drafts`, to: "/admin/articles", pending: articlesPending },
    { label: "Projects", value: projects?.length ?? 0, hint: "total", to: "/admin/projects", pending: projectsPending },
    {
      label: "Lab runs",
      value: experiments?.length ?? 0,
      hint: `${running} in progress`,
      to: "/admin/lab",
      pending: experimentsPending,
    },
    { label: "Team", value: team?.length ?? 0, hint: "members", to: "/admin/team", pending: teamPending },
    { label: "Feedback", value: feedbackList.length, hint: "new", to: "/admin/feedback", pending: feedbackPending },
  ]

  const recent = [
    ...articleList.slice(0, 4).map((article) => ({
      key: `article-${article.id}`,
      title: article.title,
      meta: article.status === ARTICLE_STATUS.DRAFT ? "Research draft" : "Research",
      href: `/admin/articles/${article.id}`,
    })),
    ...feedbackList.slice(0, 3).map((item) => ({
      key: `feedback-${item.id}`,
      title: item.message,
      meta: `Feedback from ${item.name}`,
      href: "/admin/feedback",
    })),
  ].slice(0, 6)

  return (
    <div className="space-y-14">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="dm-title">Overview</h1>
          <p className="dm-subtitle mt-1">Published research, lab runs, projects and incoming signals.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/articles/new">
              <Plus aria-hidden />
              New research
            </Link>
          </Button>
          <Button asChild variant="outline" className={adminOutlineClass}>
            <Link to="/admin/lab/new">New experiment</Link>
          </Button>
        </div>
      </header>

      <dl className="grid gap-px overflow-hidden rounded-3xl border border-[var(--lab-line)] bg-[var(--lab-line)] sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            to={metric.to}
            className="group flex flex-col justify-between gap-8 bg-[var(--lab-bg)] p-6 no-underline transition-colors hover:bg-[var(--lab-card)]"
          >
            <dt className="flex items-center justify-between text-[15px] text-[var(--lab-ink-soft)]">
              {metric.label}
              <ArrowUpRight
                className="size-4 transition-colors group-hover:text-[var(--lab-orange)]"
                aria-hidden
              />
            </dt>
            <dd>
              {metric.pending ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <span className="block text-4xl font-medium tracking-tight text-[var(--lab-ink)]">
                  {metric.value}
                </span>
              )}
              <span className="mt-1 block text-sm text-[var(--lab-ink-soft)]">{metric.hint}</span>
            </dd>
          </Link>
        ))}
      </dl>

      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="text-xl font-medium text-[var(--lab-ink)]">
          Recent activity
        </h2>
        {recent.length === 0 ? (
          <p className="dm-body mt-4">No activity yet.</p>
        ) : (
          <ul className="mt-4 border-b border-[var(--lab-line)]">
            {recent.map((item) => (
              <li key={item.key}>
                <Link to={item.href} className="dm-row dm-link">
                  <span className="min-w-0">
                    <span className="block truncate text-[17px] font-medium">{item.title}</span>
                    <span className="dm-body mt-0.5 block">{item.meta}</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
