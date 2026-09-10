import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import {
  LayoutDashboard,
  FileText,
  FolderGit2,
  Users,
  Inbox,
  ArrowRight,
  LogOut,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  Hash,
} from "lucide-react"
import { authClient } from "#/lib/auth-client"
import { Button } from "#/components/ui/button"
import { ROUTES } from "#/lib/domain/routes"
import { cn } from "#/lib/utils"

type AdminSession = { user: { id: string; email: string; role?: string | null } }

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }): Promise<{ session?: AdminSession }> => {
    if (location.pathname === "/admin/login") {
      return {}
    }
    const result = await authClient.getSession()
    const user = result.data?.user as
      | { id: string; email: string; role?: string | null }
      | undefined
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    return { session: { user: { id: user.id, email: user.email, role: user.role ?? "ADMIN" } } }
  },
  errorComponent: () => <AdminUnauthorized />,
  component: AdminLayout,
})

type AdminNavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  match?: "exact" | "prefix"
}

const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, match: "exact" },
  { to: "/admin/articles", label: "Research", icon: FileText },
  { to: "/admin/projects", label: "Projects", icon: FolderGit2 },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/feedback", label: "Feedback", icon: Inbox },
  { to: "/admin/categories", label: "Categories", icon: FolderGit2 },
  { to: "/admin/tags", label: "Tags", icon: Hash },
]

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const context = Route.useRouteContext() as { session?: AdminSession }
  const session = context.session
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [])

  async function handleSignOut() {
    await authClient.signOut()
    navigate({ to: ROUTES.HOME })
  }

  if (location.pathname === "/admin/login" || !session) {
    return <Outlet />
  }

  return (
    <div className="lab-page-bg min-h-screen text-[var(--lab-ink)]">
      <div className="flex min-h-screen">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen flex-1 flex-col">
          <AdminTopbar
            onOpenSidebar={() => setSidebarOpen(true)}
            session={session}
            onSignOut={handleSignOut}
          />

          <main className="flex-1 overflow-x-hidden">
            <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--lab-line)] bg-[var(--lab-card)] transition-transform md:static md:z-auto md:w-64 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--lab-line)] px-5">
          <Link to={ROUTES.ADMIN} className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--lab-ink)] no-underline">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[var(--lab-orange)]" />
            XNINETZY Admin
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p className="px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
            Workspace
          </p>
          <ul className="mt-3 space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--lab-ink-soft)] no-underline transition-colors hover:bg-[var(--lab-card-elevated)] hover:text-[var(--lab-ink)]"
                    activeProps={{
                      className:
                        "bg-[var(--lab-orange-soft)] text-[var(--lab-orange)] hover:bg-[var(--lab-orange-soft)] hover:text-[var(--lab-orange)]",
                    }}
                  >
                    <Icon className="size-4" aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <p className="mt-8 px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
            Public site
          </p>
          <ul className="mt-3 space-y-1">
            {[
              { to: ROUTES.HOME, label: "Home" },
              { to: ROUTES.RESEARCH, label: "Research" },
              { to: ROUTES.PROJECTS, label: "Projects" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-[var(--lab-ink-soft)] no-underline transition-colors hover:bg-[var(--lab-card-elevated)] hover:text-[var(--lab-ink)]"
                >
                  <span>{item.label}</span>
                  <ExternalLink className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-[var(--lab-line)] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
            Signed in as
          </p>
          <p className="mt-1 truncate text-sm font-medium text-[var(--lab-ink)]">admin@xninetzy.local</p>
        </div>
      </aside>
    </>
  )
}

function AdminTopbar({
  onOpenSidebar,
  session,
  onSignOut,
}: {
  onOpenSidebar: () => void
  session: { user: { email: string } }
  onSignOut: () => void
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--lab-line)] bg-[var(--lab-card)]/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </Button>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] sm:flex"
        >
          <Sparkles className="size-3.5 text-[var(--lab-orange)]" aria-hidden />
          Admin workspace
          <ArrowRight className="size-3 text-[var(--lab-line-strong)]" aria-hidden />
          <span className="text-[var(--lab-ink)]">{session.user.email}</span>
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="font-mono" onClick={onSignOut}>
          <LogOut className="size-3.5" aria-hidden />
          Sign out
        </Button>
      </div>
    </header>
  )
}

function AdminUnauthorized() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate({ to: "/admin/login" })
  }, [navigate])
  return (
    <div className="lab-page-bg flex min-h-screen items-center justify-center px-4 text-[var(--lab-ink)]">
      <div className="research-card-surface max-w-sm p-8 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
          Unauthorized
        </p>
        <p className="mt-3 text-sm text-[var(--lab-ink-soft)]">Redirecting to sign in…</p>
      </div>
    </div>
  )
}
