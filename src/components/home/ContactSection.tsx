import { useRef, useState } from "react"
import { motion } from "motion/react"
import {
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
  Paperclip,
  Send,
  X,
} from "lucide-react"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Textarea } from "#/components/ui/textarea"
import { Label } from "#/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import {
  BRIEF_SERVICE_OPTIONS,
  type BriefService,
} from "#/lib/schemas/brief"
import { useSubmitBrief } from "#/hooks/useBriefs"
import { buildBriefMessage, buildWhatsappUrl, CONTACT_INFO, SERVICE_OFFERINGS } from "#/lib/domain/services"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"

const FIELD_CLASS =
  "border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)] focus-visible:ring-[var(--lab-orange)]/30 focus-visible:border-[var(--lab-orange)]"

type AttachmentMeta = {
  name: string
  size: number
  file: File
}

const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ContactSection() {
  const submit = useSubmitBrief()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [service, setService] = useState<BriefService>("WEB")
  const [budget, setBudget] = useState("")
  const [timeline, setTimeline] = useState("")
  const [message, setMessage] = useState("")
  const [attachment, setAttachment] = useState<AttachmentMeta | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAttachmentError(null)
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError("Max attachment size is 4 MB.")
      event.target.value = ""
      return
    }
    setAttachment({ name: file.name, size: file.size, file })
  }

  function clearAttachment() {
    setAttachment(null)
    setAttachmentError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const [attachmentUploading, setAttachmentUploading] = useState(false)

  async function uploadAndSubmit(): Promise<void> {
    if (!attachment) return
    setAttachmentUploading(true)
    setErrors({})
    try {
      const form = new FormData()
      form.append("file", attachment.file, attachment.file.name)
      form.append("purpose", "brief-attachment")
      const response = await fetch("/api/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      })
      const data = (await response.json()) as
        | { ok: true; data: { url: string } }
        | { ok: false; error: { message: string } }
      if (!data.ok) {
        setErrors({ name: data.error.message })
        return
      }
      await submit.mutateAsync({
        name,
        email,
        company: company || undefined,
        whatsapp: whatsapp || undefined,
        service,
        budget: budget || undefined,
        timeline: timeline || undefined,
        message,
        documentUrl: data.data.url,
        documentName: attachment.file.name,
        documentMimeType: attachment.file.type,
      })
      setName("")
      setEmail("")
      setCompany("")
      setWhatsapp("")
      setService("WEB")
      setBudget("")
      setTimeline("")
      setMessage("")
      clearAttachment()
    } catch (error) {
      setErrors(extractZodErrors(error) ?? {})
    } finally {
      setAttachmentUploading(false)
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    if (attachment) {
      await uploadAndSubmit()
      return
    }
    try {
      await submit.mutateAsync({
        name,
        email,
        company: company || undefined,
        whatsapp: whatsapp || undefined,
        service,
        budget: budget || undefined,
        timeline: timeline || undefined,
        message,
      })
      setName("")
      setEmail("")
      setCompany("")
      setWhatsapp("")
      setService("WEB")
      setBudget("")
      setTimeline("")
      setMessage("")
      clearAttachment()
    } catch (error) {
      setErrors(extractZodErrors(error) ?? {})
    }
  }

  const whatsappMessage = buildBriefMessage({
    id: "draft",
    name: name || "[Your name]",
    email: email || "[Your email]",
    company: company || null,
    whatsapp: whatsapp || null,
    service: SERVICE_OFFERINGS.find((s) => s.key.toUpperCase() === service)?.title ?? service,
    budget: budget || null,
    timeline: timeline || null,
    message: message || "[Tell us what you want to build]",
    documentUrl: null,
  })
  const whatsappLink = buildWhatsappUrl(whatsappMessage)

  return (
    <section id="contact" className="lab-page-bg border-b border-[var(--lab-line)] py-24">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mb-10 max-w-3xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-4xl">
            Tell us what you want to build
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--lab-ink-soft)] sm:text-base">
            Submit the form for an email reply. Open WhatsApp for instant chat.
            We answer both within 24 hours.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_OPTIONS}
            transition={{ duration: 0.5 }}
            onSubmit={onSubmit}
            className="research-card-surface p-6 sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="brief-name" className="text-[var(--lab-ink)]">
                  Name
                </Label>
                <Input
                  id="brief-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className={FIELD_CLASS}
                  placeholder="Your name"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brief-email" className="text-[var(--lab-ink)]">
                  Email
                </Label>
                <Input
                  id="brief-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className={FIELD_CLASS}
                  placeholder="you@company.com"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brief-company" className="text-[var(--lab-ink)]">
                  Company <span className="text-[var(--lab-ink-soft)]">(optional)</span>
                </Label>
                <Input
                  id="brief-company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className={FIELD_CLASS}
                  placeholder="Company / Personal"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brief-whatsapp" className="text-[var(--lab-ink)]">
                  WhatsApp <span className="text-[var(--lab-ink-soft)]">(optional)</span>
                </Label>
                <Input
                  id="brief-whatsapp"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  className={FIELD_CLASS}
                  placeholder="+62 8xx-xxxx-xxxx"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="brief-service" className="text-[var(--lab-ink)]">
                  Service
                </Label>
                <Select
                  value={service}
                  onValueChange={(value) => setService(value as BriefService)}
                >
                  <SelectTrigger id="brief-service" className={`w-full ${FIELD_CLASS}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={FIELD_CLASS}>
                    {BRIEF_SERVICE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brief-budget" className="text-[var(--lab-ink)]">
                  Budget <span className="text-[var(--lab-ink-soft)]">(optional)</span>
                </Label>
                <Input
                  id="brief-budget"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className={FIELD_CLASS}
                  placeholder="e.g. 50–100jt"
                />
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <Label htmlFor="brief-timeline" className="text-[var(--lab-ink)]">
                Timeline <span className="text-[var(--lab-ink-soft)]">(optional)</span>
              </Label>
              <Input
                id="brief-timeline"
                value={timeline}
                onChange={(event) => setTimeline(event.target.value)}
                className={FIELD_CLASS}
                placeholder="e.g. 6 weeks"
              />
            </div>

            <div className="mt-4 space-y-1.5">
              <Label htmlFor="brief-message" className="text-[var(--lab-ink)]">
                Brief
              </Label>
              <Textarea
                id="brief-message"
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                className={FIELD_CLASS}
                placeholder="What you want to build, the problem to solve, or the key features needed…"
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Label className="text-[var(--lab-ink)]">
                Attachment <span className="text-[var(--lab-ink-soft)]">(PDF / DOC / image, max 4 MB)</span>
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*,.doc,.docx,.txt"
                  onChange={onFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-[var(--lab-line)] bg-[var(--lab-card-elevated)] text-[var(--lab-ink)]"
                >
                  <Paperclip className="size-4" aria-hidden />
                  Upload brief / mockup
                </Button>
                {attachment && (
                  <div className="flex items-center gap-2 border border-[var(--lab-line)] bg-[var(--lab-card-elevated)] px-3 py-1.5 text-xs text-[var(--lab-ink)]">
                    <FileText className="size-3.5 text-[var(--lab-orange)]" aria-hidden />
                    <span className="font-mono">{attachment.name}</span>
                    <span className="text-[var(--lab-ink-soft)]">{formatBytes(attachment.size)}</span>
                    <button
                      type="button"
                      onClick={clearAttachment}
                      aria-label="Remove attachment"
                      className="text-[var(--lab-ink-soft)] transition-colors hover:text-destructive"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </div>
                )}
              </div>
              {attachmentError && (
                <p className="text-xs text-destructive">{attachmentError}</p>
              )}
            </div>

            {submit.isError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Could not submit</AlertTitle>
                <AlertDescription>
                  Please check the form and try again. If the problem persists,
                  message us on WhatsApp.
                </AlertDescription>
              </Alert>
            )}
            {submit.isSuccess && (
              <Alert className="mt-4 border-[var(--lab-orange-glow)] bg-[var(--lab-orange-soft)]">
                <CheckCircle2 className="size-4 text-[var(--lab-orange)]" aria-hidden />
                <AlertTitle className="text-[var(--lab-ink)]">Brief received</AlertTitle>
                <AlertDescription className="text-[var(--lab-ink-soft)]">
                  Email queued — we reply within {CONTACT_INFO.responseTime}. You can
                  also open WhatsApp to chat instantly.
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
                Reply within {CONTACT_INFO.responseTime}
              </p>
              <Button type="submit" disabled={submit.isPending || attachmentUploading} className="font-mono">
                {submit.isPending || attachmentUploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="size-4" aria-hidden />
                    Send brief
                  </>
                )}
              </Button>
            </div>
          </motion.form>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_OPTIONS}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="research-card-surface group flex flex-col gap-3 p-6 transition-colors hover:border-[var(--lab-orange-glow)]"
            >
              <MessageCircle className="size-5 text-[var(--lab-orange)]" aria-hidden />
              <p className="text-lg font-semibold text-[var(--lab-ink)]">
                Chat on WhatsApp
              </p>
              <p className="text-sm text-[var(--lab-ink-soft)]">
                Opens WhatsApp with your brief pre-filled. Fastest path to a
                live conversation.
              </p>
              <p className="mt-auto font-mono text-sm text-[var(--lab-ink)]">
                {CONTACT_INFO.whatsappDisplay}
              </p>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--lab-orange)]">
                Open chat →
              </span>
            </a>

            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="research-card-surface flex flex-col gap-3 p-6 transition-colors hover:border-[var(--lab-orange)]/50"
            >
              <Mail className="size-5 text-[var(--lab-orange)]" aria-hidden />
              <p className="text-lg font-semibold text-[var(--lab-ink)]">
                {CONTACT_INFO.email}
              </p>
              <p className="text-sm text-[var(--lab-ink-soft)]">
                For longer briefs, RFPs, or anything that needs attachments
                beyond 4 MB.
              </p>
            </a>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}

function extractZodErrors(error: unknown): Record<string, string> | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray(
      (error as { issues: Array<{ path: Array<string | number>; message: string }> })
        .issues,
    )
  ) {
    const result: Record<string, string> = {}
    for (const issue of (
      error as { issues: Array<{ path: Array<string | number>; message: string }> }
    ).issues) {
      const key = String(issue.path[0] ?? "_")
      result[key] = issue.message
    }
    return result
  }
  return null
}
