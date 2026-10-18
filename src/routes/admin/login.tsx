import { useState, type FormEvent } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { primaryPillClass } from "#/components/deepmind/styles"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { authClient } from "#/lib/auth-client"
import { ROUTES } from "#/lib/domain/routes"

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Sign in — X90 Labs Admin" }],
  }),
  component: AdminLoginPage,
})

const fieldClass =
  "h-12 rounded-xl border-[var(--lab-line-strong)] bg-transparent px-4 text-[var(--lab-ink)] shadow-none placeholder:text-[var(--lab-ink-soft)]/60 focus-visible:border-[var(--lab-orange)] focus-visible:ring-[var(--lab-orange)]/20"

function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
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
      await navigate({ to: ROUTES.ADMIN })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 text-[var(--lab-ink)]">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[15px] text-[var(--lab-ink-soft)] no-underline hover:text-[var(--lab-orange)]"
        >
          <ArrowLeft className="size-4" aria-hidden />
          X90 Labs
        </Link>
        <h1 className="dm-title mt-10">Sign in</h1>
        <p className="dm-subtitle mt-1">Admin workspace. Accounts are created by the lab.</p>

        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[15px] font-medium text-[var(--lab-ink)]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[15px] font-medium text-[var(--lab-ink)]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClass}
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>{error}</p>
            </div>
          ) : null}

          <Button type="submit" disabled={submitting} className={`${primaryPillClass} w-full`}>
            {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {submitting ? "Signing in…" : "Continue"}
          </Button>
        </form>
      </div>
    </main>
  )
}
