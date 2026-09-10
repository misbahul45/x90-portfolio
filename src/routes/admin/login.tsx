import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Loader2, Lock, ArrowRight, AlertCircle } from "lucide-react"
import { authClient } from "#/lib/auth-client"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { ROUTES } from "#/lib/domain/routes"
import { fadeInUp, staggerContainer, staggerItem } from "#/lib/motion-variants"

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Sign in — XNINETZY Labs Admin" }],
  }),
  component: AdminLoginPage,
})

function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await authClient.signIn.email({ email, password })
      if ("error" in result && result.error) {
        setError(result.error.message ?? "Invalid credentials.")
        return
      }
      const session = await authClient.getSession()
      const user = session.data?.user as
        | { id: string; email: string; role?: string | null }
        | undefined
      if (user?.role !== "ADMIN") {
        setError("This account is not authorized for the admin workspace.")
        await authClient.signOut()
        return
      }
      navigate({ to: ROUTES.ADMIN })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="lab-page-bg relative min-h-screen overflow-hidden text-[var(--lab-ink)]">
      <div className="grid min-h-screen lg:grid-cols-[1fr_420px]">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="hidden flex-col justify-between border-r border-[var(--lab-line)] p-12 lg:flex"
        >
          <motion.div variants={staggerItem}>
            <a
              href={ROUTES.HOME}
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--lab-ink)] no-underline"
            >
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[var(--lab-orange)]" />
              XNINETZY LABS
            </a>
          </motion.div>
          <motion.div variants={staggerItem} className="max-w-md space-y-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
              Admin · Internal
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--lab-ink)] sm:text-5xl">
              Sign in to the workspace.
            </h1>
            <p className="text-base leading-relaxed text-[var(--lab-ink-soft)]">
              Manage articles, projects, team members, and incoming feedback.
              Public sign-up is disabled — credentials are seeded by the lab.
            </p>
            <div className="rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)] p-4 font-mono text-[11px] text-[var(--lab-ink-soft)]">
              <p className="font-semibold text-[var(--lab-ink)]">Seeded credentials</p>
              <p className="mt-2">email: <span className="text-[var(--lab-ink)]">admin@xninetzy.local</span></p>
              <p>password: <span className="text-[var(--lab-ink)]">XninetzyDev2026!</span></p>
              <p className="mt-2 text-[var(--lab-orange)]">Rotate this in production.</p>
            </div>
          </motion.div>
          <motion.div variants={staggerItem} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
            <Lock className="size-3.5 text-[var(--lab-orange)]" aria-hidden />
            protected by Better Auth · session cookie
          </motion.div>
        </motion.section>

        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex items-center justify-center px-6 py-16 sm:px-10"
        >
          <form
            onSubmit={onSubmit}
            className="research-card-surface w-full max-w-sm space-y-6 p-8 sm:p-10"
          >
            <header className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)] lg:hidden">
                Admin · Internal
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--lab-ink)]">Sign in</h2>
              <p className="text-sm text-[var(--lab-ink-soft)]">
                Use your seeded admin credentials.
              </p>
            </header>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[var(--lab-ink)]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[var(--lab-ink)]">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="size-3.5 shrink-0 translate-y-0.5" aria-hidden />
                <p>{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full font-mono" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </Button>

            <a
              href={ROUTES.HOME}
              className="block text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
            >
              ← Back to public site
            </a>
          </form>
        </motion.section>
      </div>
    </main>
  )
}
