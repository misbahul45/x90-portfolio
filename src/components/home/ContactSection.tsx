import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Textarea } from "#/components/ui/textarea"
import { Label } from "#/components/ui/label"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#/components/ui/alert"
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
import {
  buildBriefMessage,
  buildWhatsappUrl,
  CONTACT_INFO,
  SERVICE_OFFERINGS,
} from "#/lib/domain/services"
import {
  fadeInUp,
  VIEWPORT_OPTIONS,
} from "#/lib/motion-variants"

const FIELD_CLASS =
  "h-11 rounded-lg border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]/55 transition-all duration-300 focus-visible:border-[var(--lab-orange)]/50 focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)]/10"

const TEXTAREA_CLASS =
  "min-h-[150px] rounded-lg border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]/55 transition-all duration-300 focus-visible:border-[var(--lab-orange)]/50 focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)]/10"

const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024

type AttachmentMeta = {
  name: string
  size: number
  file: File
}

type FormErrors = Record<string, string>

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function extractZodErrors(
  error: unknown,
): FormErrors | null {
  if (
    typeof error !== "object" ||
    error === null ||
    !("issues" in error)
  ) {
    return null
  }

  const issues = (
    error as {
      issues?: Array<{
        path: Array<string | number>
        message: string
      }>
    }
  ).issues

  if (!Array.isArray(issues)) {
    return null
  }

  const result: FormErrors = {}

  for (const issue of issues) {
    const key = String(issue.path[0] ?? "_")
    result[key] = issue.message
  }

  return result
}

export function ContactSection() {
  const submit = useSubmitBrief()
  const fileInputRef =
    useRef<HTMLInputElement>(null)
  const reducedMotion = useReducedMotion()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [service, setService] =
    useState<BriefService>("WEB")
  const [budget, setBudget] = useState("")
  const [timeline, setTimeline] =
    useState("")
  const [message, setMessage] = useState("")
  const [attachment, setAttachment] =
    useState<AttachmentMeta | null>(null)
  const [attachmentError, setAttachmentError] =
    useState<string | null>(null)
  const [attachmentUploading, setAttachmentUploading] =
    useState(false)
  const [errors, setErrors] =
    useState<FormErrors>({})

  const selectedService =
    SERVICE_OFFERINGS.find(
      (item) =>
        item.key.toUpperCase() === service,
    )

  const whatsappMessage = buildBriefMessage({
    id: "draft",
    name: name || "[Your name]",
    email: email || "[Your email]",
    company: company || null,
    whatsapp: whatsapp || null,
    service:
      selectedService?.title ?? service,
    budget: budget || null,
    timeline: timeline || null,
    message:
      message ||
      "[Tell us what you want to build]",
    documentUrl: null,
  })

  const whatsappLink =
    buildWhatsappUrl(whatsappMessage)

  const resetForm = () => {
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

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setAttachmentError(null)

    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError(
        "Maximum attachment size is 4 MB.",
      )

      event.target.value = ""
      return
    }

    setAttachment({
      name: file.name,
      size: file.size,
      file,
    })
  }

  const clearAttachment = () => {
    setAttachment(null)
    setAttachmentError(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const submitBrief = async (
    document?: {
      url: string
      name: string
      mimeType: string
    },
  ) => {
    await submit.mutateAsync({
      name,
      email,
      company: company || undefined,
      whatsapp: whatsapp || undefined,
      service,
      budget: budget || undefined,
      timeline: timeline || undefined,
      message,
      documentUrl: document?.url,
      documentName: document?.name,
      documentMimeType: document?.mimeType,
    })
  }

  const uploadAttachment = async () => {
    if (!attachment) {
      return null
    }

    setAttachmentUploading(true)

    try {
      const form = new FormData()

      form.append(
        "file",
        attachment.file,
        attachment.file.name,
      )

      form.append(
        "purpose",
        "brief-attachment",
      )

      const response = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: form,
          credentials: "include",
        },
      )

      const data = (await response.json()) as
        | {
            ok: true
            data: {
              url: string
            }
          }
        | {
            ok: false
            error: {
              message: string
            }
          }

      if (!data.ok) {
        setAttachmentError(
          data.error.message,
        )

        return null
      }

      return {
        url: data.data.url,
        name: attachment.file.name,
        mimeType: attachment.file.type,
      }
    } finally {
      setAttachmentUploading(false)
    }
  }

  const onSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setErrors({})
    setAttachmentError(null)

    try {
      const uploaded =
        await uploadAttachment()

      await submitBrief(uploaded ?? undefined)

      resetForm()
    } catch (error) {
      setErrors(
        extractZodErrors(error) ?? {
          _: "Something went wrong. Please try again.",
        },
      )
    }
  }

  const isSubmitting =
    submit.isPending ||
    attachmentUploading

  return (
    <section
      id="contact"
      className="lab-page-bg relative overflow-hidden border-b border-[var(--lab-line)] py-24 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--lab-orange)]/25 to-transparent"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[12%] size-[420px] rounded-full bg-[var(--lab-orange)]/[0.035] blur-[120px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--lab-orange)]">
                Project intake
              </span>

              <span className="h-px w-12 bg-[var(--lab-orange)]/35" />
            </div>

            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[var(--lab-ink)] sm:text-4xl lg:text-[48px] lg:leading-[1.04]">
              Tell us what you
              <span className="block text-[var(--lab-ink-soft)]">
                want to build.
              </span>
            </h2>
          </div>

          <div>
            <p className="max-w-xl text-sm leading-[1.85] text-[var(--lab-ink-soft)] sm:text-base">
              Start with the problem, constraints, desired outcome, or even a
              rough idea. We will turn it into a concrete engineering
              conversation.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
              <span>
                <span className="text-[var(--lab-orange)]">
                  {CONTACT_INFO.responseTime}
                </span>{" "}
                response
              </span>

              <span>
                <span className="text-[var(--lab-orange)]">
                  01
                </span>{" "}
                intake loop
              </span>

              <span>
                <span className="text-[var(--lab-orange)]">
                  PROD
                </span>{" "}
                focused
              </span>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-[1.25rem] border border-[var(--lab-line)] bg-[var(--lab-line)] lg:grid-cols-[1fr_360px]">
          <motion.form
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={VIEWPORT_OPTIONS}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            onSubmit={onSubmit}
            className="relative overflow-hidden bg-[var(--lab-card)] p-6 sm:p-8 lg:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--lab-orange)]/50 to-transparent"
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-[var(--lab-line)] pb-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
                    Project brief
                  </p>

                  <p className="mt-1 text-[11px] text-[var(--lab-ink-soft)]">
                    Tell us enough to understand the system.
                  </p>
                </div>

                <span className="font-mono text-[8px] text-[var(--lab-ink-soft)]/45">
                  01 / 01
                </span>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field
                  id="brief-name"
                  label="Name"
                  error={errors.name}
                >
                  <Input
                    id="brief-name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    required
                    placeholder="Your name"
                    className={FIELD_CLASS}
                  />
                </Field>

                <Field
                  id="brief-email"
                  label="Email"
                  error={errors.email}
                >
                  <Input
                    id="brief-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    placeholder="you@company.com"
                    className={FIELD_CLASS}
                  />
                </Field>

                <Field
                  id="brief-company"
                  label="Company"
                  optional
                >
                  <Input
                    id="brief-company"
                    name="company"
                    autoComplete="organization"
                    value={company}
                    onChange={(event) =>
                      setCompany(
                        event.target.value,
                      )
                    }
                    placeholder="Company / Personal"
                    className={FIELD_CLASS}
                  />
                </Field>

                <Field
                  id="brief-whatsapp"
                  label="WhatsApp"
                  optional
                >
                  <Input
                    id="brief-whatsapp"
                    name="whatsapp"
                    autoComplete="tel"
                    value={whatsapp}
                    onChange={(event) =>
                      setWhatsapp(
                        event.target.value,
                      )
                    }
                    placeholder="+62 8xx-xxxx-xxxx"
                    className={FIELD_CLASS}
                  />
                </Field>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="brief-service"
                    className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink)]"
                  >
                    Service
                  </Label>

                  <Select
                    value={service}
                    onValueChange={(value) =>
                      setService(
                        value as BriefService,
                      )
                    }
                  >
                    <SelectTrigger
                      id="brief-service"
                      className={`w-full ${FIELD_CLASS}`}
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {BRIEF_SERVICE_OPTIONS.map(
                        (option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Field
                  id="brief-budget"
                  label="Budget"
                  optional
                >
                  <Input
                    id="brief-budget"
                    name="budget"
                    value={budget}
                    onChange={(event) =>
                      setBudget(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. 50–100jt"
                    className={FIELD_CLASS}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field
                  id="brief-timeline"
                  label="Timeline"
                  optional
                >
                  <Input
                    id="brief-timeline"
                    name="timeline"
                    value={timeline}
                    onChange={(event) =>
                      setTimeline(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. 6 weeks"
                    className={FIELD_CLASS}
                  />
                </Field>
              </div>

              <div className="mt-5 space-y-2">
                <Label
                  htmlFor="brief-message"
                  className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink)]"
                >
                  Brief
                </Label>

                <Textarea
                  id="brief-message"
                  name="message"
                  rows={6}
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value,
                    )
                  }
                  required
                  placeholder="What are you trying to build? What problem should it solve? What constraints matter?"
                  className={TEXTAREA_CLASS}
                />

                {errors.message && (
                  <p className="text-xs text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="mt-5 rounded-lg border border-[var(--lab-line)] bg-white/[0.015] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--lab-ink)]">
                      Attachment
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--lab-ink-soft)]">
                      PDF, DOC, image, or TXT · max 4 MB
                    </p>
                  </div>

                  <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]/45">
                    Optional
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,image/*,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="border-[var(--lab-line)] bg-[var(--lab-card-elevated)] font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--lab-ink)] hover:border-[var(--lab-orange)]/40 hover:bg-[var(--lab-orange)]/[0.04]"
                  >
                    Attach file
                  </Button>

                  {attachment && (
                    <div className="flex min-w-0 items-center gap-2 rounded-md border border-[var(--lab-line)] bg-[var(--lab-card-elevated)] px-3 py-2">
                      <span className="truncate font-mono text-[9px] text-[var(--lab-ink)]">
                        {attachment.name}
                      </span>

                      <span className="shrink-0 font-mono text-[8px] text-[var(--lab-ink-soft)]">
                        {formatBytes(
                          attachment.size,
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={
                          clearAttachment
                        }
                        aria-label="Remove attachment"
                        className="font-mono text-[9px] text-[var(--lab-ink-soft)] transition-colors hover:text-destructive"
                      >
                        remove
                      </button>
                    </div>
                  )}
                </div>

                {attachmentError && (
                  <p className="mt-3 text-xs text-destructive">
                    {attachmentError}
                  </p>
                )}
              </div>

              {errors._ && (
                <Alert
                  variant="destructive"
                  className="mt-5"
                >
                  <AlertTitle>
                    Submission failed
                  </AlertTitle>

                  <AlertDescription>
                    {errors._}
                  </AlertDescription>
                </Alert>
              )}

              {submit.isError && !errors._ && (
                <Alert
                  variant="destructive"
                  className="mt-5"
                >
                  <AlertTitle>
                    Could not submit
                  </AlertTitle>

                  <AlertDescription>
                    Check the form and try again,
                    or send the brief through
                    WhatsApp.
                  </AlertDescription>
                </Alert>
              )}

              {submit.isSuccess && (
                <Alert className="mt-5 border-[var(--lab-orange-glow)] bg-[var(--lab-orange-soft)]">
                  <AlertTitle className="text-[var(--lab-ink)]">
                    Brief received
                  </AlertTitle>

                  <AlertDescription className="text-[var(--lab-ink-soft)]">
                    Your submission is queued.
                    We reply within{" "}
                    {CONTACT_INFO.responseTime}.
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-7 flex flex-col gap-4 border-t border-[var(--lab-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
                    Response window
                  </p>

                  <p className="mt-1 text-sm text-[var(--lab-ink)]">
                    Within{" "}
                    {CONTACT_INFO.responseTime}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 rounded-lg bg-[var(--lab-orange)] px-5 font-mono text-[10px] uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-[var(--lab-orange)]/90 hover:shadow-[0_10px_30px_rgba(246,90,11,0.2)]"
                >
                  {isSubmitting
                    ? "Sending..."
                    : "Send brief →"}
                </Button>
              </div>
            </div>
          </motion.form>

          <motion.aside
            initial={{
              opacity: 0,
              x: 12,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={VIEWPORT_OPTIONS}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: "easeOut",
            }}
            className="relative bg-[#09182a] p-6 sm:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                maskImage:
                  "radial-gradient(circle at 50% 20%, black, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(circle at 50% 20%, black, transparent 75%)",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
                  Fast path
                </p>

                <span className="font-mono text-[8px] text-white/20">
                  LIVE
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                Start the conversation.
              </h3>

              <p className="mt-3 text-sm leading-[1.8] text-white/40">
                The form creates a structured brief. WhatsApp skips directly
                into a pre-filled conversation.
              </p>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="group mt-7 block rounded-xl border border-[var(--lab-orange)]/25 bg-[var(--lab-orange)]/[0.06] p-4 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[var(--lab-orange)]/50 hover:bg-[var(--lab-orange)]/[0.1]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-orange)]">
                    WhatsApp
                  </span>

                  <span className="font-mono text-[11px] text-white/35 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--lab-orange)]">
                    →
                  </span>
                </div>

                <p className="mt-3 font-mono text-sm text-white/80">
                  {CONTACT_INFO.whatsappDisplay}
                </p>

                <p className="mt-1 text-[10px] leading-relaxed text-white/35">
                  Pre-filled with the current brief state.
                </p>
              </a>

              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="group mt-3 block rounded-xl border border-white/[0.07] bg-white/[0.015] p-4 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[var(--lab-orange)]/20 hover:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Email
                  </span>

                  <span className="font-mono text-[11px] text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--lab-orange)]">
                    →
                  </span>
                </div>

                <p className="mt-3 truncate text-sm text-white/70">
                  {CONTACT_INFO.email}
                </p>

                <p className="mt-1 text-[10px] leading-relaxed text-white/30">
                  Best for longer briefs and larger attachments.
                </p>
              </a>

              <div className="mt-8 border-t border-white/[0.07] pt-6">
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/20">
                  Brief preview
                </p>

                <AnimatePreview
                  reducedMotion={reducedMotion}
                  service={
                    selectedService?.title ??
                    service
                  }
                  budget={budget}
                  timeline={timeline}
                  message={message}
                />
              </div>

              <div className="mt-7 border-t border-white/[0.07] pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/20">
                    Response
                  </span>

                  <span className="font-mono text-[9px] text-[var(--lab-orange)]">
                    {CONTACT_INFO.responseTime}
                  </span>
                </div>

                <div className="mt-3 flex gap-1">
                  {Array.from({
                    length: 8,
                  }).map((_, index) => (
                    <motion.span
                      key={index}
                      className="h-1 flex-1 rounded-full bg-[var(--lab-orange)]/20"
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              opacity:
                                index < 6
                                  ? [
                                      0.25,
                                      0.7,
                                      0.25,
                                    ]
                                  : 0.18,
                            }
                      }
                      transition={
                        reducedMotion
                          ? undefined
                          : {
                              duration: 1.8,
                              delay:
                                index * 0.08,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={VIEWPORT_OPTIONS}
          transition={{
            duration: 0.5,
            delay: 0.15,
          }}
          className="mt-5 flex flex-col gap-2 border-t border-[var(--lab-line)] pt-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/55">
            problem → scope → system → production
          </p>

          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]/35">
            XNINETZY LABS
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  optional = false,
  error,
  children,
}: {
  id: string
  label: string
  optional?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink)]"
      >
        {label}

        {optional && (
          <span className="ml-1 text-[var(--lab-ink-soft)]/60">
            optional
          </span>
        )}
      </Label>

      {children}

      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function AnimatePreview({
  reducedMotion,
  service,
  budget,
  timeline,
  message,
}: {
  reducedMotion: boolean | null
  service: string
  budget: string
  timeline: string
  message: string
}) {
  const previewMessage =
    message ||
    "Your project brief will appear here as you write..."

  return (
    <AnimateText
      reducedMotion={Boolean(
        reducedMotion,
      )}
      service={service}
      budget={budget}
      timeline={timeline}
      message={previewMessage}
    />
  )
}

function AnimateText({
  reducedMotion,
  service,
  budget,
  timeline,
  message,
}: {
  reducedMotion: boolean
  service: string
  budget: string
  timeline: string
  message: string
}) {
  const previewRows = [
    ["service", service],
    ["budget", budget || "not specified"],
    ["timeline", timeline || "not specified"],
  ]

  return (
    <motion.div
      layout
      transition={{
        duration: reducedMotion ? 0 : 0.25,
      }}
      className="space-y-3"
    >
      {previewRows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between gap-4"
        >
          <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/20">
            {label}
          </span>

          <span className="truncate text-[10px] text-white/45">
            {value}
          </span>
        </div>
      ))}

      <div className="border-t border-white/[0.05] pt-3">
        <p className="line-clamp-3 text-[10px] leading-[1.7] text-white/30">
          {message}
        </p>
      </div>
    </motion.div>
  )
}