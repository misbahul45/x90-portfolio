import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Plus, Trash2, ExternalLink, Github, Linkedin, Globe, Loader2 } from "lucide-react"
import {
  useAdminCreateTeamMember,
  useAdminDeleteTeamMember,
  useAdminTeam,
  useAdminUpdateTeamMember,
} from "#/hooks/useAdminTeam"
import { AdminPageHeader } from "#/components/admin/AdminPageHeader"
import { adminIconButtonClass, adminInputClass, adminPanelClass } from "#/components/admin/styles"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Textarea } from "#/components/ui/textarea"
import { Label } from "#/components/ui/label"
import { Switch } from "#/components/ui/switch"
import { Skeleton } from "#/components/ui/skeleton"
import { cn } from "#/lib/utils"

type TeamMember = {
  id: string
  name: string
  role: string
  bio: string | null
  avatar: string | null
  github: string | null
  linkedin: string | null
  website: string | null
  featured: boolean
  order: number
}

export const Route = createFileRoute("/admin/team")({
  head: () => ({ meta: [{ title: "Team — Admin" }] }),
  component: AdminTeamPage,
})

const EMPTY_FORM = {
  id: "",
  name: "",
  role: "",
  bio: "",
  avatar: "",
  github: "",
  linkedin: "",
  website: "",
  featured: false,
  order: 0,
}

function AdminTeamPage() {
  const { data: members, isPending, isError } = useAdminTeam()
  const createMember = useAdminCreateTeamMember()
  const updateMember = useAdminUpdateTeamMember()
  const deleteMember = useAdminDeleteTeamMember()
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setForm({
        id: editing.id,
        name: editing.name,
        role: editing.role,
        bio: editing.bio ?? "",
        avatar: editing.avatar ?? "",
        github: editing.github ?? "",
        linkedin: editing.linkedin ?? "",
        website: editing.website ?? "",
        featured: editing.featured,
        order: editing.order,
      })
    } else {
      setForm({ ...EMPTY_FORM })
    }
  }, [editing])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        name: form.name,
        role: form.role,
        bio: form.bio || null,
        avatar: form.avatar || null,
        github: form.github || null,
        linkedin: form.linkedin || null,
        website: form.website || null,
        featured: form.featured,
        order: Number(form.order) || 0,
      }
      if (editing) {
        await updateMember.mutateAsync({ id: editing.id, ...payload })
      } else {
        await createMember.mutateAsync(payload)
      }
      setForm({ ...EMPTY_FORM })
      setEditing(null)
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save member.")
    } finally {
      setSubmitting(false)
    }
  }

  async function onDelete(id: string, name: string) {
    if (typeof window !== "undefined" && !window.confirm(`Remove "${name}" from the team?`)) return
    await deleteMember.mutateAsync(id)
    if (editing?.id === id) {
      setEditing(null)
      setShowForm(false)
    }
  }

  const startCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
  }

  const startEdit = (member: TeamMember) => {
    setEditing(member)
    setShowForm(true)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Team"
        description="Profiles shown on the public About page and homepage."
        action={
          showForm ? undefined : (
            <Button type="button" onClick={startCreate}>
              <Plus aria-hidden />
              Add member
            </Button>
          )
        }
      />

      {showForm && (
        <form onSubmit={onSubmit} className={cn(adminPanelClass, "space-y-5 p-6")}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-[var(--lab-ink)]">
              {editing ? "Edit member" : "New member"}
            </h2>
            <Button
              type="button"
              variant="ghost"
              className="text-[var(--lab-ink-soft)]"
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
            >
              Cancel
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="team-name" className="text-[var(--lab-ink)]">Name</Label>
              <Input
                id="team-name"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className={adminInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-role" className="text-[var(--lab-ink)]">Role</Label>
              <Input
                id="team-role"
                required
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                placeholder="Founder · AI Engineer"
                className={adminInputClass}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-bio" className="text-[var(--lab-ink)]">Bio</Label>
            <Textarea
              id="team-bio"
              rows={3}
              value={form.bio}
              onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
              className={cn(adminInputClass, "h-auto min-h-24 py-2.5")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-avatar" className="text-[var(--lab-ink)]">Avatar URL</Label>
            <Input
              id="team-avatar"
              value={form.avatar}
              onChange={(event) => setForm((prev) => ({ ...prev, avatar: event.target.value }))}
              className={adminInputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="team-github" className="text-[var(--lab-ink)]">GitHub</Label>
              <Input
                id="team-github"
                type="url"
                value={form.github}
                onChange={(event) => setForm((prev) => ({ ...prev, github: event.target.value }))}
                className={adminInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-linkedin" className="text-[var(--lab-ink)]">LinkedIn</Label>
              <Input
                id="team-linkedin"
                type="url"
                value={form.linkedin}
                onChange={(event) => setForm((prev) => ({ ...prev, linkedin: event.target.value }))}
                className={adminInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-website" className="text-[var(--lab-ink)]">Website</Label>
              <Input
                id="team-website"
                type="url"
                value={form.website}
                onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
                className={adminInputClass}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-3 text-[15px] text-[var(--lab-ink)]">
              <Switch
                checked={form.featured}
                onCheckedChange={(value) => setForm((prev) => ({ ...prev, featured: value }))}
                aria-label="Feature on homepage"
              />
              Feature on homepage
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" aria-hidden /> : <Plus aria-hidden />}
              {editing ? "Save changes" : "Add member"}
            </Button>
          </div>
        </form>
      )}

      {isPending && (
        <div className="space-y-3">
          {[0, 1].map((index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-destructive">Unable to load team.</p>}

      {members && members.length === 0 && !isPending && (
        <div className={cn(adminPanelClass, "p-10")}>
          <p className="text-xl font-medium text-[var(--lab-ink)]">No team members yet</p>
          <p className="dm-body mt-2">Add a member to show them on the About page.</p>
        </div>
      )}

      {members && members.length > 0 && (
        <div className={cn(adminPanelClass, "overflow-hidden")}>
          <ul className="divide-y divide-[var(--lab-line)]">
            {members.map((member) => (
              <li
                key={member.id}
                className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[2fr_1fr_140px] sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt=""
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-[var(--lab-card-elevated)] text-sm font-medium text-[var(--lab-orange)]">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-[var(--lab-ink)]">
                      {member.name}
                    </p>
                    <p className="truncate text-sm text-[var(--lab-ink-soft)]">
                      {member.role}
                      {member.featured ? " · Featured" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[var(--lab-ink-soft)] [&_a]:no-underline [&_a:hover]:text-[var(--lab-orange)]">
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                      <Github className="size-4" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                      <Linkedin className="size-4" />
                    </a>
                  )}
                  {member.website && (
                    <a href={member.website} target="_blank" rel="noreferrer" aria-label="Website">
                      <Globe className="size-4" />
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(member)}
                    aria-label={`Edit ${member.name}`}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${member.name}`}
                    onClick={() => void onDelete(member.id, member.name)}
                    disabled={deleteMember.isPending}
                  >
                    <Trash2 className="size-4 text-[var(--lab-ink-soft)] hover:text-destructive" />
                  </Button>
                  <Button asChild size="icon" variant="ghost" aria-label="View public" className={adminIconButtonClass}>
                    <a href="/about" target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
