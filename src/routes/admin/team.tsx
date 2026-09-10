import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Plus, Trash2, ExternalLink, Github, Linkedin, Globe, Loader2 } from "lucide-react"
import {
  useAdminCreateTeamMember,
  useAdminDeleteTeamMember,
  useAdminTeam,
  useAdminUpdateTeamMember,
} from "#/hooks/useAdminTeam"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Textarea } from "#/components/ui/textarea"
import { Label } from "#/components/ui/label"
import { Switch } from "#/components/ui/switch"
import { Skeleton } from "#/components/ui/skeleton"
import { fadeInUp } from "#/lib/motion-variants"

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
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
            Team
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--lab-ink)]">
            Lab members
          </h1>
          <p className="mt-2 text-sm text-[var(--lab-ink-soft)]">
            Profiles shown on the public About and Homepage.
          </p>
        </div>
        {!showForm && (
          <Button type="button" onClick={startCreate} className="font-mono">
            <Plus className="size-4" />
            Add member
          </Button>
        )}
      </motion.header>

      {showForm && (
        <motion.form
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          onSubmit={onSubmit}
          className="research-card-surface space-y-4 p-6"
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
              {editing ? "Edit member" : "New member"}
            </p>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] transition-colors hover:text-[var(--lab-ink)]"
            >
              Cancel
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="team-name" className="text-[var(--lab-ink)]">Name</Label>
              <Input
                id="team-name"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
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
                className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]"
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
              className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-avatar" className="text-[var(--lab-ink)]">Avatar URL</Label>
            <Input
              id="team-avatar"
              value={form.avatar}
              onChange={(event) => setForm((prev) => ({ ...prev, avatar: event.target.value }))}
              className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
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
                className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-linkedin" className="text-[var(--lab-ink)]">LinkedIn</Label>
              <Input
                id="team-linkedin"
                type="url"
                value={form.linkedin}
                onChange={(event) => setForm((prev) => ({ ...prev, linkedin: event.target.value }))}
                className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-website" className="text-[var(--lab-ink)]">Website</Label>
              <Input
                id="team-website"
                type="url"
                value={form.website}
                onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
                className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
              <Switch
                checked={form.featured}
                onCheckedChange={(value) => setForm((prev) => ({ ...prev, featured: value }))}
                aria-label="Feature on homepage"
              />
              Feature on homepage
            </label>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting} className="font-mono">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {editing ? "Save changes" : "Add member"}
            </Button>
          </div>
        </motion.form>
      )}

      {isPending && (
        <div className="space-y-2">
          {[0, 1].map((index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-destructive">Unable to load team.</p>}

      {members && members.length === 0 && !isPending && (
        <p className="text-sm text-[var(--lab-ink-soft)]">No team members yet.</p>
      )}

      {members && members.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)]">
          <ul className="divide-y divide-[var(--lab-line)]">
            {members.map((member) => (
              <li
                key={member.id}
                className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[2fr_1fr_140px] sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--lab-card-elevated)] font-mono text-xs font-semibold text-[var(--lab-orange)]">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--lab-ink)]">
                      {member.name}
                      {member.featured && (
                        <span className="lab-tech-tag ml-2 align-middle">Featured</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-[var(--lab-ink-soft)]">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[var(--lab-ink-soft)]">
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                      <Github className="size-3.5" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                      <Linkedin className="size-3.5" />
                    </a>
                  )}
                  {member.website && (
                    <a href={member.website} target="_blank" rel="noreferrer" aria-label="Website">
                      <Globe className="size-3.5" />
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
                    <Trash2 className="size-3.5 text-[var(--lab-ink-soft)] hover:text-destructive" />
                  </Button>
                  <Button asChild size="icon" variant="ghost" aria-label="View public">
                    <a href="/about" target="_blank" rel="noreferrer">
                      <ExternalLink className="size-3.5" />
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
