export const SERVICE_KEY = {
  AUTOMATION: "automation",
  AI_ASSISTANT: "ai-assistant",
  AGENTIC_SYSTEM: "agentic-system",
  WEB: "web",
  MOBILE: "mobile",
} as const

export type ServiceKey = (typeof SERVICE_KEY)[keyof typeof SERVICE_KEY]

export type ServiceOffering = {
  key: ServiceKey
  index: string
  title: string
  tagline: string
  description: string
  deliverables: string[]
  stack: string[]
  icon: "automation" | "assistant" | "agent" | "web" | "mobile"
}

export const SERVICE_OFFERINGS: ReadonlyArray<ServiceOffering> = [
  {
    key: SERVICE_KEY.AUTOMATION,
    index: "01",
    title: "Automation",
    tagline: "Workflows that run themselves",
    description:
      "We design and ship custom automation pipelines that connect APIs, databases, and humans into repeatable workflows. Triggers, branches, retries, audit — built once, run forever.",
    deliverables: [
      "Custom pipeline design + self-host",
      "API + database connectors",
      "Error handling, retries, alerts",
      "Operational runbook + handover",
    ],
    stack: ["Node.js", "TypeScript", "Postgres", "Redis", "Webhooks"],
    icon: "automation",
  },
  {
    key: SERVICE_KEY.AI_ASSISTANT,
    index: "02",
    title: "AI Assistant",
    tagline: "Domain assistants that know your business",
    description:
      "Retrieval-grounded chat assistants tied to your docs, knowledge base, or product data. Citation-backed answers, role-aware permissions, deployment where your data lives.",
    deliverables: [
      "Knowledge ingestion pipeline",
      "Retrieval + reranking layer",
      "Conversational UX + citations",
      "Analytics dashboard + feedback loop",
    ],
    stack: ["LLM APIs", "pgvector", "Tiptap", "TanStack", "Better Auth"],
    icon: "assistant",
  },
  {
    key: SERVICE_KEY.AGENTIC_SYSTEM,
    index: "03",
    title: "Agentic System",
    tagline: "Autonomous workflows that think",
    description:
      "Tool-using agents that plan, retrieve, act, and verify. Memory, observability, guardrails. Production-grade — not demos. Built on the same stack our lab publishes research on.",
    deliverables: [
      "Planner + tool runtime",
      "Episodic + semantic memory",
      "Execution graph observability",
      "Eval harness + regression suite",
    ],
    stack: ["Python", "TypeScript", "LangGraph", "PostgreSQL", "Docker"],
    icon: "agent",
  },
  {
    key: SERVICE_KEY.WEB,
    index: "04",
    title: "Web End-to-End",
    tagline: "Full-stack products, shipped",
    description:
      "From landing pages to dashboards to SaaS. Modern stack, strong UX foundations, real auth and data. You bring the idea, we ship the product.",
    deliverables: [
      "Design system + page composition",
      "Full-stack app + database",
      "Auth, billing, admin panel",
      "CI/CD + observability",
    ],
    stack: ["TanStack Start", "React 19", "Postgres", "Tailwind", "Prisma"],
    icon: "web",
  },
  {
    key: SERVICE_KEY.MOBILE,
    index: "05",
    title: "Mobile End-to-End",
    tagline: "Native-feel apps on iOS + Android",
    description:
      "Cross-platform mobile apps with shared backend. Push notifications, offline sync, biometric auth. Ship to both stores without doubling the codebase.",
    deliverables: [
      "Cross-platform app (iOS + Android)",
      "Shared backend API",
      "Push notifications + auth",
      "Store submission + release pipeline",
    ],
    stack: ["React Native", "Expo", "Native modules", "EAS", "REST/GraphQL"],
    icon: "mobile",
  },
]

export function findService(key: string): ServiceOffering | undefined {
  return SERVICE_OFFERINGS.find((service) => service.key === key)
}

export const PROCESS_STEPS: ReadonlyArray<{
  index: string
  title: string
  description: string
  duration: string
}> = [
  {
    index: "01",
    title: "Brief",
    description:
      "Tell us what you want to build. Drop a doc, fill the form, or message on WhatsApp. We reply within 24 hours.",
    duration: "Day 0",
  },
  {
    index: "02",
    title: "Scope",
    description:
      "We translate the brief into deliverables, milestones, and a fixed-price quote. You sign off before any code is written.",
    duration: "Day 1–2",
  },
  {
    index: "03",
    title: "Build",
    description:
      "Weekly demos in staging. You see real progress every Friday. No black boxes, no surprises.",
    duration: "Week 1–N",
  },
  {
    index: "04",
    title: "Ship",
    description:
      "Production deploy, monitoring, runbook handover. Optional ongoing retainer for maintenance.",
    duration: "End",
  },
]

export const TECH_STACK: ReadonlyArray<{ group: string; items: string[] }> = [
  {
    group: "Frontend",
    items: ["TanStack Start", "React 19", "Tailwind CSS", "Motion", "shadcn"],
  },
  {
    group: "Backend",
    items: ["Node.js", "Python", "PostgreSQL", "Prisma", "tRPC"],
  },
  {
    group: "AI / Data",
    items: ["LLM APIs", "pgvector", "Rerankers", "Embeddings", "LangGraph"],
  },
  {
    group: "Automation",
    items: ["Node.js", "Webhooks", "REST + GraphQL", "Redis", "Workers"],
  },
  {
    group: "Mobile",
    items: ["React Native", "Expo", "EAS", "Push", "Biometrics"],
  },
  {
    group: "DevOps",
    items: ["Docker", "GitHub Actions", "Cloudflare", "Postgres backups", "Logs"],
  },
]

export const CONTACT_INFO = {
  email: "xninetzy@gmail.com",
  whatsappNumber: "6285649204151",
  whatsappDisplay: "+62 856-4920-4151",
  responseTime: "24 hours",
} as const

export function buildWhatsappUrl(message: string): string {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${encoded}`
}

export type BriefMessagePayload = {
  id: string
  name: string
  email: string
  company?: string | null
  whatsapp?: string | null
  service: string
  budget?: string | null
  timeline?: string | null
  message: string
  documentUrl?: string | null
}

export function buildBriefMessage(payload: BriefMessagePayload): string {
  const lines: string[] = [
    `Hi XNINETZY Labs, I'm ${payload.name}.`,
    "",
    `Service: ${payload.service}`,
  ]
  if (payload.company) lines.push(`Company: ${payload.company}`)
  if (payload.budget) lines.push(`Budget: ${payload.budget}`)
  if (payload.timeline) lines.push(`Timeline: ${payload.timeline}`)
  if (payload.documentUrl) lines.push(`Brief doc: ${payload.documentUrl}`)
  lines.push("")
  lines.push("Message:")
  lines.push(payload.message)
  lines.push("")
  lines.push(`Email: ${payload.email}`)
  if (payload.whatsapp) lines.push(`My WhatsApp: ${payload.whatsapp}`)
  lines.push(`Brief ID: ${payload.id}`)
  return lines.join("\n")
}
