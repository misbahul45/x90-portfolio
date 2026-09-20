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
    tagline: "Turn repetitive work into systems",
    description:
      "Reliable workflows that connect your tools, data, APIs, and people into one repeatable system.",
    deliverables: [
      "Workflow architecture",
      "API + database integration",
      "Retries, alerts, audit",
      "Self-hosted deployment",
    ],
    stack: ["Node.js", "TypeScript", "Postgres", "Redis", "Webhooks"],
    icon: "automation",
  },
  {
    key: SERVICE_KEY.AI_ASSISTANT,
    index: "02",
    title: "AI Assistant",
    tagline: "AI grounded in your data",
    description:
      "Practical assistants that retrieve your knowledge, answer with context, and fit into your existing product.",
    deliverables: [
      "Knowledge ingestion",
      "Retrieval + reranking",
      "Chat + citations",
      "Feedback analytics",
    ],
    stack: ["LLM APIs", "pgvector", "TanStack", "Better Auth"],
    icon: "assistant",
  },
  {
    key: SERVICE_KEY.AGENTIC_SYSTEM,
    index: "03",
    title: "Agentic System",
    tagline: "Systems that plan, act, verify",
    description:
      "Tool-using agents built for real execution — with memory, observability, evaluation, and human control.",
    deliverables: [
      "Agent runtime",
      "Tool + memory layer",
      "Execution observability",
      "Evaluation harness",
    ],
    stack: ["Python", "TypeScript", "LangGraph", "PostgreSQL", "Docker"],
    icon: "agent",
  },
  {
    key: SERVICE_KEY.WEB,
    index: "04",
    title: "Web Products",
    tagline: "From idea to production",
    description:
      "Full-stack products with strong UX, real data, authentication, and infrastructure ready to operate.",
    deliverables: [
      "Product architecture",
      "Full-stack application",
      "Auth + admin",
      "CI/CD + observability",
    ],
    stack: ["TanStack Start", "React 19", "Postgres", "Prisma", "Tailwind"],
    icon: "web",
  },
  {
    key: SERVICE_KEY.MOBILE,
    index: "05",
    title: "Mobile Products",
    tagline: "One product, both platforms",
    description:
      "Cross-platform mobile applications backed by the same reliable systems powering your web product.",
    deliverables: [
      "iOS + Android app",
      "Shared backend",
      "Push + authentication",
      "Release pipeline",
    ],
    stack: ["React Native", "Expo", "EAS", "Native Modules"],
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
      "Tell us the problem, product, or workflow you want to change.",
    duration: "Day 0",
  },
  {
    index: "02",
    title: "Scope",
    description:
      "We turn the idea into a clear system, milestones, and deliverables before development starts.",
    duration: "Day 1–2",
  },
  {
    index: "03",
    title: "Build",
    description:
      "You see working progress throughout development, not just at the end.",
    duration: "Week 1–N",
  },
  {
    index: "04",
    title: "Ship",
    description:
      "We deploy the system, document it, and leave you with something that can actually run.",
    duration: "Release",
  },
]

export const TECH_STACK: ReadonlyArray<{
  group: string
  items: string[]
}> = [
  {
    group: "Frontend",
    items: ["TanStack Start", "React", "Tailwind", "Motion", "shadcn"],
  },
  {
    group: "Backend",
    items: ["Node.js", "Python", "PostgreSQL", "Prisma", "tRPC"],
  },
  {
    group: "AI / Data",
    items: ["LLMs", "pgvector", "Embeddings", "Reranking", "LangGraph"],
  },
  {
    group: "Automation",
    items: ["Webhooks", "REST", "GraphQL", "Redis", "Workers"],
  },
  {
    group: "Mobile",
    items: ["React Native", "Expo", "EAS", "Push", "Biometrics"],
  },
  {
    group: "Infrastructure",
    items: ["Docker", "GitHub Actions", "Cloudflare", "Backups", "Logs"],
  },
]

export const LAB_VISION = {
  headline: "Build products today. Build the lab tomorrow.",
  description:
    "XNINETZY starts by building useful software, AI systems, and automation for real problems. The long-term goal is bigger: grow into an independent engineering and research lab where products, experiments, and original AI research continuously inform each other.",
  trajectory: [
    "Build useful systems",
    "Study what works",
    "Run experiments",
    "Publish what we learn",
    "Build the lab",
  ],
} as const

export const LAB_POSITIONING = {
  label: "XNINETZY Labs",
  statement: "Software engineering with a research mindset.",
  supporting:
    "We build production systems today while developing the engineering, AI, and research capabilities needed for the lab we want to become.",
} as const

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

  if (payload.whatsapp) {
    lines.push(`My WhatsApp: ${payload.whatsapp}`)
  }

  lines.push(`Brief ID: ${payload.id}`)

  return lines.join("\n")
}