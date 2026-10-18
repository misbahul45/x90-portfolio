import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react"
import { ArrowUpRight, Paperclip, X } from "lucide-react"
import { Reveal } from "#/components/deepmind/Reveal"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { primaryPillClass, outlinePillClass } from "#/components/deepmind/styles"
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import { Textarea } from "#/components/ui/textarea"
import {
  useSubmitBrief,
  useUploadBriefAttachment,
  type BriefAttachmentUpload,
} from "#/hooks/useBriefs"
import {
  buildBriefMessage,
  buildWhatsappUrl,
  CONTACT_INFO,
  SERVICE_OFFERINGS,
} from "#/lib/domain/services"
import { BRIEF_SERVICE_OPTIONS, type BriefService } from "#/lib/schemas/brief"
import { cn } from "#/lib/utils"

const fieldClass =
  "h-12 rounded-xl border-[var(--lab-line-strong)] bg-transparent px-4 text-[var(--lab-ink)] shadow-none placeholder:text-[var(--lab-ink-soft)]/60 focus-visible:border-[var(--lab-orange)] focus-visible:ring-[var(--lab-orange)]/20"

const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024

type FormErrors = Record<string, string>

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function extractZodErrors(error: unknown): FormErrors | null {
  if (typeof error !== "object" || error === null || !("issues" in error)) return null
  const issues = (error as { issues?: Array<{ path: Array<string | number>; message: string }> }).issues
  if (!Array.isArray(issues)) return null
  const result: FormErrors = {}
  for (const issue of issues) {
    result[String(issue.path[0] ?? "_")] = issue.message
  }
  return result
}

type FieldProps = {
  id: string
  label: string
  optional?: boolean
  error?: string
  className?: string
  children: ReactNode
}

function Field({ id, label, optional = false, error, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-[15px] font-medium text-[var(--lab-ink)]">
        {label}
        {optional ? <span className="font-normal text-[var(--lab-ink-soft)]"> (optional)</span> : null}
      </Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

export function ContactSection() {
  const submit = useSubmitBrief()
  const upload = useUploadBriefAttachment()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [service, setService] = useState<BriefService>("WEB")
  const [budget, setBudget] = useState("")
  const [timeline, setTimeline] = useState("")
  const [message, setMessage] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const selectedService = SERVICE_OFFERINGS.find((item) => item.key.toUpperCase() === service)

  const whatsappLink = buildWhatsappUrl(
    buildBriefMessage({
      id: "draft",
      name: name || "[Your name]",
      email: email || "[Your email]",
      company: company || null,
      whatsapp: whatsapp || null,
      service: selectedService?.title ?? service,
      budget: budget || null,
      timeline: timeline || null,
      message: message || "[Tell us what you want to build]",
      documentUrl: null,
    }),
  )

  const resetFileInput = (): void => {
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const resetForm = (): void => {
    setName("")
    setEmail("")
    setCompany("")
    setWhatsapp("")
    setService("WEB")
    setBudget("")
    setTimeline("")
    setMessage("")
    setErrors({})
    setAttachmentError(null)
    setAttachment(null)
    resetFileInput()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setAttachmentError(null)
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError("Maximum attachment size is 4 MB.")
      event.target.value = ""
      return
    }
    setAttachment(file)
  }

  const clearAttachment = (): void => {
    setAttachment(null)
    setAttachmentError(null)
    resetFileInput()
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setErrors({})
    setAttachmentError(null)

    let uploaded: BriefAttachmentUpload | undefined
    if (attachment) {
      try {
        uploaded = await upload.mutateAsync(attachment)
      } catch (error) {
        setAttachmentError(error instanceof Error ? error.message : "The attachment could not be uploaded.")
        return
      }
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
        documentUrl: uploaded?.url,
        documentName: uploaded?.name,
        documentMimeType: uploaded?.mimeType,
      })
      resetForm()
    } catch (error) {
      setErrors(
        extractZodErrors(error) ?? {
          _: error instanceof Error && error.message ? error.message : "Something went wrong. Please try again.",
        },
      )
    }
  }

  const isSubmitting = submit.isPending || upload.isPending

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="dm-section border-t border-[var(--lab-line)]"
    >
      <div className="dm-shell">
        <Reveal>
          <SectionHeader
            headingId="contact-heading"
            title="Tell us what you want to build"
            description="Start with the problem, the constraints or a rough idea. We turn it into an engineering conversation."
          />
        </Reveal>

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20">
          <Reveal>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="brief-name" label="Name" error={errors.name}>
                  <Input
                    id="brief-name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="Your name"
                    className={fieldClass}
                  />
                </Field>
                <Field id="brief-email" label="Email" error={errors.email}>
                  <Input
                    id="brief-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="you@company.com"
                    className={fieldClass}
                  />
                </Field>
                <Field id="brief-company" label="Company" optional error={errors.company}>
                  <Input
                    id="brief-company"
                    name="company"
                    autoComplete="organization"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Company or personal"
                    className={fieldClass}
                  />
                </Field>
                <Field id="brief-whatsapp" label="WhatsApp" optional error={errors.whatsapp}>
                  <Input
                    id="brief-whatsapp"
                    name="whatsapp"
                    type="tel"
                    autoComplete="tel"
                    value={whatsapp}
                    onChange={(event) => setWhatsapp(event.target.value)}
                    placeholder="+62 8xx-xxxx-xxxx"
                    className={fieldClass}
                  />
                </Field>
                <Field id="brief-service" label="Service">
                  <Select value={service} onValueChange={(value) => setService(value as BriefService)}>
                    <SelectTrigger id="brief-service" className={cn("w-full data-[size=default]:h-12", fieldClass)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BRIEF_SERVICE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id="brief-budget" label="Budget" optional error={errors.budget}>
                  <Input
                    id="brief-budget"
                    name="budget"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    placeholder="e.g. 50–100jt"
                    className={fieldClass}
                  />
                </Field>
                <Field id="brief-timeline" label="Timeline" optional error={errors.timeline} className="sm:col-span-2">
                  <Input
                    id="brief-timeline"
                    name="timeline"
                    value={timeline}
                    onChange={(event) => setTimeline(event.target.value)}
                    placeholder="e.g. 6 weeks"
                    className={fieldClass}
                  />
                </Field>
              </div>

              <Field id="brief-message" label="Brief" error={errors.message}>
                <Textarea
                  id="brief-message"
                  name="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  placeholder="What are you trying to build? What problem should it solve? What constraints matter?"
                  className={cn("min-h-40 rounded-xl px-4 py-3", fieldClass, "h-auto")}
                />
              </Field>

              <div className="border-t border-[var(--lab-line)] pt-6">
                <p className="text-[15px] font-medium text-[var(--lab-ink)]">Attachment</p>
                <p className="dm-body mt-1">PDF, DOC, image or TXT, up to 4 MB.</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,image/*,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Attach a file"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className={outlinePillClass}
                  >
                    <Paperclip aria-hidden />
                    Attach file
                  </Button>
                  {attachment ? (
                    <p className="flex min-w-0 items-center gap-2 text-sm text-[var(--lab-ink)]">
                      <span className="truncate">{attachment.name}</span>
                      <span className="shrink-0 text-[var(--lab-ink-soft)]">{formatBytes(attachment.size)}</span>
                      <button
                        type="button"
                        onClick={clearAttachment}
                        aria-label="Remove attachment"
                        className="rounded-full p-1 text-[var(--lab-ink-soft)] hover:text-destructive"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </p>
                  ) : null}
                </div>
                {attachmentError ? <p className="mt-3 text-sm text-destructive">{attachmentError}</p> : null}
              </div>

              {errors._ ? (
                <Alert variant="destructive">
                  <AlertTitle>Submission failed</AlertTitle>
                  <AlertDescription>{errors._}</AlertDescription>
                </Alert>
              ) : null}

              {submit.isError && !errors._ ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not submit</AlertTitle>
                  <AlertDescription>
                    Check the form and try again, or send the brief through WhatsApp.
                  </AlertDescription>
                </Alert>
              ) : null}

              {submit.isSuccess ? (
                <Alert className="border-[var(--lab-orange)]/40 bg-[var(--lab-orange-soft)]">
                  <AlertTitle className="text-[var(--lab-ink)]">Brief received</AlertTitle>
                  <AlertDescription className="text-[var(--lab-ink-soft)]">
                    Your submission is queued. We reply within {CONTACT_INFO.responseTime}.
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="dm-body">We reply within {CONTACT_INFO.responseTime}.</p>
                <Button type="submit" disabled={isSubmitting} className={primaryPillClass}>
                  {isSubmitting ? "Sending…" : "Send brief"}
                  <ArrowUpRight aria-hidden />
                </Button>
              </div>
            </form>
          </Reveal>

          <Reveal delay={0.1}>
            <aside aria-labelledby="contact-fast-path">
              <h3 id="contact-fast-path" className="dm-card-title">
                Prefer a faster route?
              </h3>
              <p className="dm-body mt-2">
                WhatsApp opens a conversation pre-filled with what you have typed so far.
              </p>
              <ul className="mt-8 border-b border-[var(--lab-line)]">
                <li>
                  <a href={whatsappLink} target="_blank" rel="noreferrer" className="dm-row dm-link">
                    <span>
                      <span className="block text-[15px] font-medium">WhatsApp</span>
                      <span className="dm-body block">{CONTACT_INFO.whatsappDisplay}</span>
                    </span>
                    <ArrowUpRight className="size-5 shrink-0" aria-hidden />
                  </a>
                </li>
                <li>
                  <a href={`mailto:${CONTACT_INFO.email}`} className="dm-row dm-link">
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium">Email</span>
                      <span className="dm-body block truncate">{CONTACT_INFO.email}</span>
                    </span>
                    <ArrowUpRight className="size-5 shrink-0" aria-hidden />
                  </a>
                </li>
              </ul>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
