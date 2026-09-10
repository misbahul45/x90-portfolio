import { env } from "#/env"
import {
  buildBriefMessage,
  buildWhatsappUrl,
  CONTACT_INFO,
  type BriefMessagePayload,
} from "#/lib/domain/services"

export type BriefPayload = BriefMessagePayload & {
  documentName?: string | null
  documentMimeType?: string | null
}

export type DeliveryResult = {
  emailSent: boolean
  whatsappLink: string
  errors: string[]
}

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function fileNameFromUrl(url: string): string | null {
  try {
    const clean = url.split("?")[0]?.split("#")[0] ?? ""
    const last = clean.split("/").filter(Boolean).pop()
    return last && last.length > 0 ? last : null
  } catch {
    return null
  }
}

function inferBase64Mime(name: string | null, declared: string | null | undefined): string {
  if (declared) return declared
  if (!name) return "application/octet-stream"
  const lower = name.toLowerCase()
  if (lower.endsWith(".pdf")) return "application/pdf"
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  if (lower.endsWith(".doc")) return "application/msword"
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".txt") || lower.endsWith(".md")) return "text/plain"
  return "application/octet-stream"
}

async function fetchAttachment(
  documentUrl: string,
  documentName: string | null | undefined,
  documentMimeType: string | null | undefined,
): Promise<{ name: string; content: string } | null> {
  try {
    const response = await fetch(documentUrl)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const name = documentName?.trim() || fileNameFromUrl(documentUrl) || "brief-attachment"
    void base64
    void inferBase64Mime(name, documentMimeType)
    return { name, content: base64 }
  } catch {
    return null
  }
}

export function buildBriefEmailHtml(payload: BriefPayload): string {
  const row = (label: string, value: string | null | undefined) =>
    value
      ? `<tr><td style="padding:6px 12px;color:#94a3b8;font-family:ui-monospace,monospace;font-size:12px;letter-spacing:0.08em;text-transform:uppercase">${label}</td><td style="padding:6px 12px;color:#f0ece4;font-size:14px;${label === "Brief doc" ? "word-break:break-all" : ""}">${escapeHtml(value)}</td></tr>`
      : ""
  const attachmentNote = payload.documentUrl
    ? `<tr><td colspan="2" style="padding:8px 12px;border-top:1px solid #1f3349;background:#0a1628"><p style="margin:0;font-family:ui-monospace,monospace;font-size:11px;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase">📎 Attachment: ${escapeHtml(payload.documentName ?? fileNameFromUrl(payload.documentUrl) ?? "file")} is included with this email.</p></td></tr>`
    : ""
  return `<!doctype html>
<html>
<body style="background:#0a1628;margin:0;padding:32px;font-family:Manrope,system-ui,sans-serif">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#102a43;border:1px solid #1f3349;border-radius:12px;padding:24px">
    <tr><td>
      <p style="margin:0 0 4px 0;font-family:ui-monospace,monospace;font-size:11px;color:#f2762a;letter-spacing:0.18em;text-transform:uppercase">XNINETZY Labs — New brief</p>
      <h1 style="margin:0 0 16px 0;color:#f0ece4;font-size:22px;font-weight:600">${escapeHtml(payload.name)}</h1>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background:#0d1f37;border:1px solid #1f3349;border-radius:8px">
        ${row("Email", payload.email)}
        ${row("Service", payload.service)}
        ${row("Company", payload.company)}
        ${row("Budget", payload.budget)}
        ${row("Timeline", payload.timeline)}
        ${row("WhatsApp", payload.whatsapp)}
        ${row("Brief doc", payload.documentUrl)}
        ${attachmentNote}
      </table>
      <h2 style="margin:20px 0 8px 0;color:#f0ece4;font-size:14px;font-weight:600">Message</h2>
      <div style="background:#0d1f37;border:1px solid #1f3349;border-radius:8px;padding:16px;color:#f0ece4;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(payload.message)}</div>
      <p style="margin:20px 0 0 0;font-family:ui-monospace,monospace;font-size:11px;color:#94a3b8">Brief ID: ${escapeHtml(payload.id)}</p>
    </td></tr>
  </table>
</body>
</html>`
}

export async function dispatchBriefNotifications(payload: BriefPayload): Promise<DeliveryResult> {
  const waNumber = env.CONTACT_WHATSAPP ?? CONTACT_INFO.whatsappNumber
  const message = buildBriefMessage({
    id: payload.id,
    name: payload.name,
    email: payload.email,
    company: payload.company ?? null,
    whatsapp: payload.whatsapp ?? null,
    service: payload.service,
    budget: payload.budget ?? null,
    timeline: payload.timeline ?? null,
    message: payload.message,
    documentUrl: payload.documentUrl ?? null,
  })
  const whatsappLink = buildWhatsappUrl(message).replace(CONTACT_INFO.whatsappNumber, waNumber)

  const errors: string[] = []
  const emailSent = await sendBrevoEmail(payload)
    .then((ok) => ok)
    .catch((error: unknown) => {
      errors.push(error instanceof Error ? error.message : "Brevo send failed")
      return false
    })

  return { emailSent, whatsappLink, errors }
}

async function sendBrevoEmail(payload: BriefPayload): Promise<boolean> {
  const apiKey = env.BREVO_API_KEY
  const fromEmail = env.BREVO_FROM_EMAIL ?? env.CONTACT_EMAIL
  const fromName = env.BREVO_FROM_NAME ?? "XNINETZY Labs"
  const toEmail = env.CONTACT_EMAIL ?? CONTACT_INFO.email

  if (!apiKey || !fromEmail || !toEmail) return false

  let attachment: { content: string; name: string } | undefined
  if (payload.documentUrl) {
    const fetched = await fetchAttachment(
      payload.documentUrl,
      payload.documentName,
      payload.documentMimeType,
    )
    if (fetched) {
      const inferredName =
        fetched.name && fetched.name.length > 0 ? fetched.name : "brief-attachment"
      const mime = inferBase64Mime(
        inferredName,
        payload.documentMimeType ?? undefined,
      )
      attachment = { name: inferredName, content: fetched.content }
      void mime
    }
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: toEmail, name: "XNINETZY Labs" }],
      replyTo: { email: payload.email, name: payload.name },
      subject: `[Brief] ${payload.service} — ${payload.name}`,
      htmlContent: buildBriefEmailHtml(payload),
      textContent: buildBriefMessage({
        id: payload.id,
        name: payload.name,
        email: payload.email,
        company: payload.company ?? null,
        whatsapp: payload.whatsapp ?? null,
        service: payload.service,
        budget: payload.budget ?? null,
        timeline: payload.timeline ?? null,
        message: payload.message,
        documentUrl: payload.documentUrl ?? null,
      }),
      tags: ["brief", payload.service.toLowerCase()],
      ...(attachment
        ? {
            attachment: [
              {
                name: attachment.name,
                content: attachment.content,
              },
            ],
          }
        : {}),
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(`Brevo ${response.status}: ${text.slice(0, 200)}`)
  }
  return true
}
