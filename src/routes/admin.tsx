import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  FileText,
  FolderGit2,
  Users,
  Inbox,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Hash,
  FlaskConical,
} from "lucide-react"
import { authClient } from "#/lib/auth-client"
import { Button } from "#/components/ui/button"
import { ROUTES } from "#/lib/domain/routes"
import { cn } from "#/lib/utils"

type AdminSession = { user: { id: string; email: string; role?: string | null } }

export const Route = createFileRoute("/admin")({
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
  { to: "/admin/lab", label: "Lab", icon: FlaskConical },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/feedback", label: "Feedback", icon: Inbox },
  { to: "/admin/categories", label: "Categories", icon: FolderGit2 },
  { to: "/admin/tags", label: "Tags", icon: Hash },
]

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { data, isPending } = authClient.useSession()
  const user = data?.user as AdminSession["user"] | undefined
  const isLoginRoute = location.pathname === "/admin/login"
  const authorized = user?.role === "ADMIN"

  useEffect(() => {
    if (isLoginRoute || isPending || authorized) return
    void navigate({ to: "/admin/login" })
  }, [isLoginRoute, isPending, authorized, navigate])

  async function handleSignOut() {
    await authClient.signOut()
    await navigate({ to: ROUTES.HOME })
  }

  if (isLoginRoute) return <Outlet />

  if (isPending || !authorized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-[var(--lab-ink)]">
        <p className="dm-body">{isPending ? "Checking your session…" : "Redirecting to sign in…"}</p>
      </div>
    )
  }

  const session: AdminSession = { user }

  return (
    <div className="min-h-screen text-[var(--lab-ink)]">
      <div className="flex min-h-screen">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} session={session} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
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

function AdminSidebar({
  open,
  onClose,
  session,
}: {
  open: boolean
  onClose: () => void
  session?: { user: { email: string } }
}) {
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
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--lab-line)] bg-[var(--lab-bg)] transition-transform md:sticky md:top-0 md:z-auto md:h-screen md:w-64 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--lab-line)] px-5">
          <Link
            to={ROUTES.ADMIN}
            className="text-[17px] font-medium tracking-tight text-[var(--lab-ink)] no-underline hover:text-[var(--lab-ink)]"
          >
            X90 Admin
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

        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-6">
          <ul className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    activeOptions={{ exact: item.match === "exact" }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-[var(--lab-ink-soft)] no-underline transition-colors hover:bg-[var(--lab-card)] hover:text-[var(--lab-ink)]"
                    activeProps={{
                      className:
                        "bg-[var(--lab-card)] text-[var(--lab-ink)] hover:text-[var(--lab-ink)]",
                    }}
                  >
                    <Icon className="size-4" aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <ul className="mt-8 space-y-1 border-t border-[var(--lab-line)] pt-6">
            {[
              { to: ROUTES.HOME, label: "View site" },
              { to: ROUTES.RESEARCH, label: "Research" },
              { to: ROUTES.PROJECTS, label: "Projects" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] text-[var(--lab-ink-soft)] no-underline transition-colors hover:bg-[var(--lab-card)] hover:text-[var(--lab-ink)]"
                >
                  <span>{item.label}</span>
                  <ExternalLink className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-[var(--lab-line)] p-4">
          <p className="text-sm text-[var(--lab-ink-soft)]">Signed in as</p>
          <p className="mt-1 truncate text-[15px] text-[var(--lab-ink)]">{session?.user?.email ?? ""}</p>
        </div>
      </aside>
    </>
  )
}

function AdminTopbar({
  onOpenSidebar,
  onSignOut,
}: {
  onOpenSidebar: () => void
  session: { user: { email: string } }
  onSignOut: () => void
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--lab-line)] bg-[var(--lab-bg)]/85 px-4 backdrop-blur-md sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenSidebar}
        aria-label="Open sidebar"
      >
        <Menu className="size-5" />
      </Button>
      <span className="hidden md:block" />
      <Button
        variant="outline"
        className="rounded-full border-[var(--lab-line-strong)] bg-transparent text-[var(--lab-ink)] shadow-none hover:border-[var(--lab-orange)] hover:bg-[var(--lab-orange-soft)] hover:text-[var(--lab-orange)]"
        onClick={onSignOut}
      >
        <LogOut aria-hidden />
        Sign out
      </Button>
    </header>
  )
}
