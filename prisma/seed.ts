import { hashPassword } from "better-auth/crypto"
import { ensurePrisma, prisma } from "../src/db"

// PrismaNeon uses WebSocket under the hood. Node (used by `tsx` when running
// prisma db seed) lacks a global WebSocket. Register `ws` before any Prisma
// query so the adapter can negotiate the Neon tunnel.
import ws from "ws"
if (typeof globalThis.WebSocket === "undefined") {
  // @ts-expect-error assign Node polyfill
  globalThis.WebSocket = ws
}

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value || value.length === 0) {
    console.error(`❌ Missing required env var: ${name}`)
    process.exit(1)
  }
  return value
}

function asString(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? value : fallback
}

void requireEnv
void asString

type TiptapNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
}

const tiptapDoc = (...content: TiptapNode[]): string =>
  JSON.stringify({ type: "doc", content })

const paragraph = (text: string): TiptapNode => ({
  type: "paragraph",
  content: [{ type: "text", text }],
})

const heading = (level: number, text: string): TiptapNode => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text }],
})

const codeBlock = (language: string, code: string): TiptapNode => ({
  type: "codeBlock",
  attrs: { language },
  content: [{ type: "text", text: code }],
})

const bulletList = (...items: string[]): TiptapNode => ({
  type: "bulletList",
  content: items.map((text) => ({
    type: "listItem",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  })),
})

const blockquote = (text: string): TiptapNode => ({
  type: "blockquote",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
})

const callout = (text: string): TiptapNode => ({
  type: "callout",
  attrs: { emoji: "💡" },
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
})

// Cover image is hosted on Unsplash. We don't download — only the URL is stored.
const COVER = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1600&q=70`

const articleLongContextContent = tiptapDoc(
  heading(2, "The problem with stuffing"),
  paragraph(
    "Naive RAG chases the entire document context into the prompt. That breaks the moment your user asks a question that spans five different sections.",
  ),
  paragraph(
    "In this write-up we walk through the pipeline that powers our domain knowledge base: chunking by semantic boundaries, embedding with a 1024-dim model, hybrid search that combines BM25 and dense vectors, and a cross-encoder re-ranker at the top of the funnel.",
  ),
  heading(3, "Chunking"),
  paragraph(
    "Sentence-window chunking with overlap beats fixed-window on long-form technical docs. We use a window of 8 sentences with 2-sentence overlap.",
  ),
  codeBlock("python", "def chunk(text, window=8, overlap=2):\n    sentences = split_sentences(text)\n    step = window - overlap\n    for i in range(0, len(sentences), step):\n        yield ' '.join(sentences[i:i+window])"),
  heading(3, "Re-ranking"),
  paragraph(
    "The cross-encoder re-ranker takes the top-50 candidates and produces a final relevance score. Latency budget: 120ms. Cost budget: $0.0003 per query.",
  ),
  callout(
    "If your retrieval layer doesn't have a re-ranker, you're paying context-window tax for noise.",
  ),
  blockquote(
    "The right five passages out of fifty thousand is more valuable than the entire document at twenty times the cost.",
  ),
)

const articleNaiveRagContent = tiptapDoc(
  heading(2, "Single-shot retrieval has a blind spot"),
  paragraph(
    "Most RAG pipelines assume the answer lives in one place. It doesn't. Multi-hop questions demand chained retrieval — get the entity, then retrieve the relations, then synthesize.",
  ),
  paragraph(
    "We benchmarked four strategies on a 2,400-question internal dataset. Direct retrieval hits 47% pass-rate. Multi-hop with re-planning hits 78%. The gap is what naive RAG throws away.",
  ),
  heading(3, "When multi-hop helps"),
  bulletList(
    "Questions that name an entity indirectly (\"the company that acquired X\")",
    "Questions that require temporal reasoning (\"what changed after the Q2 migration\")",
    "Questions that span organizational boundaries",
  ),
  paragraph(
    "We use a small planner model (7B) to generate the retrieval graph, then execute it depth-first with a 4-hop budget.",
  ),
)

const articleAgenticMemoryContent = tiptapDoc(
  heading(2, "Memory is the hard part"),
  paragraph(
    "Most agent frameworks treat memory as a key-value cache. That's wrong. Memory has three layers and they decay at different rates.",
  ),
  heading(3, "Three layers"),
  bulletList(
    "Working memory: the current task's context window",
    "Episodic memory: traces of past tasks, retrievable by similarity",
    "Semantic memory: facts the agent has committed to long-term storage",
  ),
  paragraph(
    "We use a custom scheduler to promote entries between layers based on access frequency, recency, and confidence. The scheduler runs as a sidecar process.",
  ),
  codeBlock("typescript", "interface MemoryEntry {\n  id: string\n  layer: 'working' | 'episodic' | 'semantic'\n  content: string\n  embeddings: number[]\n  accessCount: number\n  lastAccessed: Date\n  confidence: number\n}"),
  callout(
    "The agent that wins the long-term benchmark is the one that knows what to forget.",
  ),
)

const articleObservabilityContent = tiptapDoc(
  heading(2, "What you can't see will fail"),
  paragraph(
    "Most agent teams ship without structured observability. They discover issues from user complaints. That's too late.",
  ),
  paragraph(
    "We instrument every tool call, every planning step, and every model invocation. The traces feed into a local evaluation pipeline that scores each run against expected behavior.",
  ),
  heading(3, "The trace schema"),
  bulletList(
    "agent_id, run_id, parent_run_id (for sub-agents)",
    "step type: plan, retrieve, tool_call, generate, verify",
    "step input, output, latency_ms, cost_usd",
    "groundedness score (1-5) against retrieved evidence",
  ),
)

const articleDeploymentContent = tiptapDoc(
  heading(2, "From notebook to production"),
  paragraph(
    "Every agent system we've shipped started as a notebook. The path from notebook to production has three non-negotiable stops.",
  ),
  heading(3, "Step 1 — Determinism"),
  paragraph(
    "Replace temperature with a structured sampling strategy. Pin model versions. Persist prompts as code.",
  ),
  heading(3, "Step 2 — Bounded resources"),
  paragraph(
    "Set per-task token budgets. Set per-task wall-clock budgets. Surface violations as first-class events, not exceptions.",
  ),
  heading(3, "Step 3 — Schema validation"),
  paragraph(
    "Validate every model output against a JSON schema before it leaves the boundary. Reject silently and re-prompt is a trap — log and surface.",
  ),
)

const articleLocalInferenceContent = tiptapDoc(
  heading(2, "7B is enough, sometimes"),
  paragraph(
    "Benchmarked Qwen2.5-7B, Llama-3.1-8B, and Mistral-7B on a curated set of 200 reasoning, extraction, and routing tasks. Ran on consumer hardware — M2 Pro, 32GB RAM, no GPU.",
  ),
  paragraph(
    "Pass-rate on structured extraction: 92% (Qwen), 89% (Llama), 84% (Mistral). Latency p95: 1.8s, 2.1s, 2.4s. Local wins on cost; cloud wins on everything else.",
  ),
  callout(
    "Use local for routing and extraction. Use cloud for synthesis. The split saves 60% on inference cost without measurable quality loss.",
  ),
)

const articleShrtContent = tiptapDoc(paragraph("Short note placeholder."))

async function main() {
  console.log("🌱 Seeding xninetzy labs database...")
  await ensurePrisma()

  await prisma.projectResearch.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.tagOnArticle.deleteMany()
  await prisma.article.deleteMany()
  await prisma.project.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.category.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  const categories = []
  for (const c of [
    { slug: "llm", name: "LLM" },
    { slug: "rag", name: "RAG" },
    { slug: "agents", name: "Agents" },
    { slug: "ml", name: "Machine Learning" },
    { slug: "dl", name: "Deep Learning" },
    { slug: "data", name: "Data Intelligence" },
  ]) {
    const created = await prisma.category.create({ data: c })
    categories.push(created)
  }
  console.log(`✅ Created ${categories.length} categories`)

  const tags = []
  for (const t of [
    { slug: "engineering", name: "Engineering" },
    { slug: "benchmark", name: "Benchmark" },
    { slug: "deep-dive", name: "Deep Dive" },
    { slug: "experiment", name: "Experiment" },
    { slug: "production", name: "Production" },
    { slug: "tooling", name: "Tooling" },
  ]) {
    const created = await prisma.tag.create({ data: t })
    tags.push(created)
  }
  console.log(`✅ Created ${tags.length} tags`)

  const adminEmail = asString(
    process.env.ADMIN_EMAIL,
    "xninetzy@gmail.com",
  ).toLowerCase().trim()
  const adminPassword = requireEnv(
    "ADMIN_PASSWORD",
    "xninetzy123",
  )
  const adminName = asString(process.env.ADMIN_NAME, "Xninetzy Admin")

  if (adminPassword.length < 8) {
    console.error("❌ ADMIN_PASSWORD must be at least 8 characters.")
    process.exit(1)
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } }).catch((e: unknown) => {
    console.error("DEBUG: findUnique failed:", e)
    throw e
  })
  if (existingAdmin) {
    console.error(`❌ Admin user already exists for ${adminEmail}. Aborting seed to avoid duplicate.`)
    console.error("   Set ADMIN_EMAIL to a different address, or delete the existing admin first.")
    process.exit(1)
  }

  const adminId = `admin_${Date.now().toString(36)}`
  const admin = await prisma.user.create({
    data: {
      id: adminId,
      email: adminEmail,
      name: adminName,
      role: "ADMIN",
      emailVerified: true,
      accounts: {
        create: {
          accountId: adminId,
          providerId: "credential",
          password: await hashPassword(adminPassword),
        },
      },
    },
  })
  console.log(`✅ Seeded admin user ${admin.email} (role=ADMIN, id=${admin.id})`)
  console.log("ℹ️  Public signup is disabled — only this seeded admin can sign in.")
  console.log("ℹ️  Set ADMIN_EMAIL and ADMIN_PASSWORD env vars to override defaults.")

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]))
  const tagBySlug = new Map(tags.map((tag) => [tag.slug, tag]))

  const articlesData = [
    {
      title: "Building Long-Context Retrieval Systems for Domain Knowledge",
      slug: "building-long-context-rag",
      excerpt:
        "Chunking, embedding, re-ranking — a practical pipeline for getting the right 5 passages out of 50,000 documents.",
      content: articleLongContextContent,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-09-08"),
      readingTime: 8,
      categorySlug: "rag",
      tagSlugs: ["engineering", "deep-dive"],
      coverImage: COVER("photo-1518770660439-4636190af475"),
    },
    {
      title: "Why Naive RAG Breaks on Multi-Hop Questions",
      slug: "why-naive-rag-fails",
      excerpt:
        "Single-shot retrieval assumes the answer is in one place. Real questions usually aren't.",
      content: articleNaiveRagContent,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-09-04"),
      readingTime: 6,
      categorySlug: "rag",
      tagSlugs: ["engineering", "benchmark"],
      coverImage: COVER("photo-1551288049-bebda4e38f71"),
    },
    {
      title: "Designing Tool-Using Agents with Execution Graphs",
      slug: "designing-tool-agents",
      excerpt:
        "Memory, planning, tools, and reasoning — the four nodes every serious agent needs, and how to wire them.",
      content: articleAgenticMemoryContent,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-08-29"),
      readingTime: 10,
      categorySlug: "agents",
      tagSlugs: ["deep-dive", "experiment"],
      coverImage: COVER("photo-1620712943543-bcc4688e7485"),
    },
    {
      title: "Observability for Agent Systems: Trace Schema and Eval Loop",
      slug: "agent-observability-traces",
      excerpt:
        "Tool calls, planning steps, model invocations — what you instrument, what you score, what you store.",
      content: articleObservabilityContent,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-08-20"),
      readingTime: 7,
      categorySlug: "agents",
      tagSlugs: ["engineering", "production"],
      coverImage: COVER("photo-1551434678-e076c223a692"),
    },
    {
      title: "From Notebook to Production: Three Stops on the Agent Path",
      slug: "notebook-to-production",
      excerpt:
        "Determinism, bounded resources, schema validation. The non-negotiable checklist before shipping an agent.",
      content: articleDeploymentContent,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-08-12"),
      readingTime: 9,
      categorySlug: "agents",
      tagSlugs: ["production", "engineering"],
      coverImage: COVER("photo-1518186285589-2f7649de83e0"),
    },
    {
      title: "Evaluating Lightweight LLMs for Local Inference",
      slug: "lightweight-llm-local",
      excerpt: "Benchmark notes from running 7B models on consumer hardware. Surprising results.",
      content: articleLocalInferenceContent,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-08-05"),
      readingTime: 6,
      categorySlug: "llm",
      tagSlugs: ["benchmark", "experiment"],
      coverImage: COVER("photo-1620712943543-2858200f7426"),
    },
    {
      title: "Embedding Model Upgrades Without Downtime",
      slug: "embedding-upgrade-pattern",
      excerpt:
        "When the embedding model improves, your vectors are now invalid. Here's the migration pattern we use.",
      content: tiptapDoc(
        heading(2, "The migration problem"),
        paragraph(
          "We upgraded from 384-dim to 1024-dim embeddings last quarter. The new model scores 11% higher on our internal eval. But the old vectors are now incompatible — they live in the same index, same dimension, different meaning.",
        ),
        heading(3, "Pattern: dual-write + lazy re-embed"),
        bulletList(
          "Write new vectors under a new namespace",
          "On read, fall back to the old namespace if the new one is missing",
          "Background job re-embeds older chunks asynchronously",
          "After coverage threshold, drop the old namespace",
        ),
      ),
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-07-22"),
      readingTime: 5,
      categorySlug: "llm",
      tagSlugs: ["engineering", "production"],
      coverImage: COVER("photo-1518770660439-4636190af475"),
    },
    {
      title: "The Cost of Hallucinations in Production",
      slug: "cost-of-hallucinations",
      excerpt:
        "We instrumented every claim our public assistant made. 6.4% were unsupported. Here's what we learned.",
      content: tiptapDoc(
        heading(2, "Ground truth"),
        paragraph(
          "We sampled 1,200 public-facing responses over four weeks. Each claim was annotated as supported, partially supported, or unsupported against the retrieved evidence.",
        ),
        paragraph(
          "Result: 91.2% supported, 2.4% partially, 6.4% unsupported. The unsupported set clustered in three categories — version numbers, internal naming, and competitive claims.",
        ),
        callout("Each unsupported claim is a future support ticket. The cost isn't accuracy — it's trust."),
      ),
      status: "DRAFT" as const,
      publishedAt: null,
      readingTime: 6,
      categorySlug: "llm",
      tagSlugs: ["benchmark", "production"],
      coverImage: COVER("photo-1485827404703-89b55fcc595e"),
    },
  ]

  for (const articleData of articlesData) {
    const { categorySlug, tagSlugs, content, ...rest } = articleData
    const article = await prisma.article.create({
      data: {
        ...rest,
        content,
        authorId: admin.id,
        categoryId: categoryBySlug.get(categorySlug)?.id,
      },
    })
    if (tagSlugs.length > 0) {
      for (const tagSlug of tagSlugs) {
        await prisma.tagOnArticle.create({
          data: {
            articleId: article.id,
            tagId: tagBySlug.get(tagSlug)!.id,
          },
        }).catch((err: unknown) => {
          const e = err as { code?: string }
          if (e.code !== "P2002") throw err
        })
      }
    }
    console.log(`  📄 ${article.title}`)
  }

  const projectsData = [
    {
      title: "Research Agent Runtime",
      slug: "research-agent-runtime",
      description:
        "A production-grade agent framework combining retrieval, planning, and tool execution. Built for long-running research workflows that survive context-window limits.",
      content: articleAgenticMemoryContent,
      technologies: ["TypeScript", "PostgreSQL", "OpenAI", "TanStack Start", "pgvector"],
      githubUrl: "https://github.com/xninetzy/research-agent-runtime",
      demoUrl: "https://research-agent.xninetzy.local",
      featured: true,
      order: 1,
      categorySlug: "agents",
      coverImage: COVER("photo-1620712943543-bcc4688e7485"),
    },
    {
      title: "Domain RAG Pipeline",
      slug: "domain-rag-pipeline",
      description:
        "End-to-end retrieval-augmented generation with semantic chunking, hybrid search, and cross-encoder re-ranking. Tuned for technical documentation.",
      content: articleLongContextContent,
      technologies: ["Python", "FastAPI", "pgvector", "Qdrant", "Next.js", "Cohere"],
      githubUrl: "https://github.com/xninetzy/domain-rag",
      demoUrl: "https://rag.xninetzy.local",
      featured: true,
      order: 2,
      categorySlug: "rag",
      coverImage: COVER("photo-1551288049-bebda4e38f71"),
    },
    {
      title: "Engineering Insights Dashboard",
      slug: "engineering-insights-dashboard",
      description:
        "Internal dashboard turning operational metrics into engineering decisions. Connects deploy logs, CI timings, and incident timelines into one weekly review.",
      content: tiptapDoc(
        paragraph(
          "A lightweight analytics layer that sits between our CI/CD output and our weekly engineering review. Pulls deploy frequency, MTTR, change failure rate, and ties them to individual service ownership.",
        ),
        bulletList(
          "Live deploy feed with rollback annotations",
          "Service ownership matrix auto-generated from CODEOWNERS",
          "Incident timeline with paged incident retros",
          "PR cycle-time distribution by team",
        ),
      ),
      technologies: ["TanStack Start", "PostgreSQL", "ClickHouse", "Tremor"],
      githubUrl: null,
      demoUrl: "https://insights.xninetzy.local",
      featured: true,
      order: 3,
      categorySlug: "data",
      coverImage: COVER("photo-1551288049-bebda4e38f71"),
    },
    {
      title: "Open Agent Eval Suite",
      slug: "open-agent-eval",
      description:
        "Open-source evaluation harness for tool-using agents. Tracks pass-rate, tool-call efficiency, and recovery from errors.",
      content: tiptapDoc(paragraph("Open agent eval framework — open-sourced under Apache 2.0.")),
      technologies: ["Python", "pytest", "Docker", "GitHub Actions"],
      githubUrl: "https://github.com/xninetzy/agent-eval",
      demoUrl: null,
      featured: false,
      order: 4,
      categorySlug: "agents",
      coverImage: COVER("photo-1551434678-e076c223a692"),
    },
    {
      title: "Local LLM Inference Gateway",
      slug: "local-llm-gateway",
      description:
        "OpenAI-compatible gateway that routes between local models and cloud APIs based on cost, latency, and capability tiers. Single interface, multiple backends.",
      content: tiptapDoc(
        paragraph(
          "We needed a single OpenAI-compatible endpoint that could route between local Qwen 7B, local Llama 3.1 8B, and cloud GPT-4o / Claude. The router picks based on task tags, cost ceiling, and latency budget.",
        ),
        bulletList(
          "OpenAI-compatible /v1/chat/completions interface",
          "Routing rules in YAML — easy to add new models",
          "Per-request cost and latency tracking",
          "Fallback chain when primary model fails",
        ),
      ),
      technologies: ["Go", "Ollama", "OpenAI API", "Anthropic API", "Redis"],
      githubUrl: "https://github.com/xninetzy/llm-gateway",
      demoUrl: "https://gateway.xninetzy.local",
      featured: true,
      order: 5,
      categorySlug: "llm",
      coverImage: COVER("photo-1620712943543-2858200f7426"),
    },
    {
      title: "Vector Migration Toolkit",
      slug: "vector-migration-toolkit",
      description:
        "Reusable migration tooling for upgrading embedding models without downtime. Dual-write, lazy re-embed, fallback chain.",
      content: tiptapDoc(
        paragraph(
          "When you upgrade your embedding model, your existing vectors become incompatible. This toolkit makes that upgrade boring.",
        ),
        bulletList(
          "Dual-write to old and new namespaces",
          "Backfill job with progress reporting",
          "Read-side fallback chain",
          "Coverage threshold for old-namespace retirement",
        ),
      ),
      technologies: ["TypeScript", "Postgres", "pgvector", "BullMQ"],
      githubUrl: "https://github.com/xninetzy/vector-migration",
      demoUrl: null,
      featured: false,
      order: 6,
      categorySlug: "llm",
      coverImage: COVER("photo-1518770660439-4636190af475"),
    },
    {
      title: "Conversational Brief Intake",
      slug: "conversational-brief-intake",
      description:
        "Production Ask Labs intake — turns natural-language project briefs into structured project records. Routes to the right team automatically.",
      content: tiptapDoc(
        paragraph(
          "A conversational intake that replaces the static contact form. The user describes what they need in plain language; the assistant extracts budget, timeline, service type, and contact details.",
        ),
        callout(
          "If your intake form has more than 6 fields, your conversion rate is already wrong.",
        ),
      ),
      technologies: ["TanStack Start", "OpenAI", "Flazz API", "Postgres"],
      githubUrl: null,
      demoUrl: "https://xninetzy.local/ask-labs",
      featured: true,
      order: 7,
      categorySlug: "agents",
      coverImage: COVER("photo-1531746790731-6c087fecd65a"),
    },
  ]

  const projectBySlug = new Map<string, string>()
  for (const projectData of projectsData) {
    const { categorySlug, ...rest } = projectData
    const project = await prisma.project.create({
      data: {
        ...rest,
        categoryId: categoryBySlug.get(categorySlug)?.id,
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - (rest.order ?? 0) * 7 * 24 * 60 * 60 * 1000),
      },
    })
    projectBySlug.set(project.slug, project.id)
    console.log(`  🚀 ${project.title}`)
  }

  // Link each project to a related research article.
  const articleSlugToId = new Map<string, string>()
  for (const article of await prisma.article.findMany({ select: { id: true, slug: true } })) {
    articleSlugToId.set(article.slug, article.id)
  }
  const relations: Array<{ projectSlug: string; articleSlug: string; relation?: string }> = [
    { projectSlug: "research-agent-runtime", articleSlug: "designing-tool-agents" },
    { projectSlug: "research-agent-runtime", articleSlug: "agent-observability-traces" },
    { projectSlug: "domain-rag-pipeline", articleSlug: "building-long-context-rag" },
    { projectSlug: "domain-rag-pipeline", articleSlug: "why-naive-rag-fails" },
    { projectSlug: "engineering-insights-dashboard", articleSlug: "notebook-to-production" },
    { projectSlug: "open-agent-eval", articleSlug: "agent-observability-traces" },
    { projectSlug: "local-llm-gateway", articleSlug: "lightweight-llm-local" },
    { projectSlug: "local-llm-gateway", articleSlug: "notebook-to-production" },
    { projectSlug: "vector-migration-toolkit", articleSlug: "embedding-upgrade-pattern" },
    { projectSlug: "conversational-brief-intake", articleSlug: "cost-of-hallucinations" },
  ]
  for (const { projectSlug, articleSlug, relation } of relations) {
    const projectId = projectBySlug.get(projectSlug)
    const articleId = articleSlugToId.get(articleSlug)
    if (!projectId || !articleId) continue
    await prisma.projectResearch
      .create({ data: { projectId, articleId, relation: relation ?? "related" } })
      .catch(() => {})
  }

  const teamData = [
    {
      name: "Misbahul Muttaqin",
      role: "Founder · AI Engineer",
      bio: "Builds agentic systems and the tools that make them observable. Believes research artifacts should ship, not sit in notebooks.",
      avatar: COVER("photo-1507003211169-0a1dd7228f2d"),
      github: "https://github.com/xninetzy",
      linkedin: "https://www.linkedin.com/in/xninetzy",
      website: "https://xninetzy.local",
      featured: true,
      order: 1,
    },
    {
      name: "Aisha Rahman",
      role: "Research Engineer",
      bio: "Works on retrieval pipelines and evaluation methodology. Focused on long-context efficiency and grounded generation.",
      avatar: COVER("photo-1494790108377-be9c29b29330"),
      github: "https://github.com/xninetzy",
      linkedin: "https://www.linkedin.com/in/xninetzy",
      website: null,
      featured: true,
      order: 2,
    },
    {
      name: "Dimas Hartono",
      role: "Systems Engineer",
      bio: "Operates the data layer. Loves Postgres query plans, hates silently drifting vector indexes.",
      avatar: COVER("photo-1500648767791-00dcc994a43e"),
      github: "https://github.com/xninetzy",
      linkedin: null,
      website: null,
      featured: true,
      order: 3,
    },
    {
      name: "Lina Kusuma",
      role: "Product Designer",
      bio: "Designs the surfaces where humans meet agent output. Cares about trust signals and progressive disclosure.",
      avatar: COVER("photo-1438761681033-6461ffad8d80"),
      github: null,
      linkedin: "https://www.linkedin.com/in/xninetzy",
      website: null,
      featured: true,
      order: 4,
    },
  ]

  for (const teamMember of teamData) {
    const member = await prisma.teamMember.create({ data: teamMember })
    console.log(`  👤 ${member.name}`)
  }

  const feedbackData = [
    {
      name: "A Curious Visitor",
      email: "visitor@example.com",
      message:
        "Loved the research-agent writeup. Are you open to collaborating on a similar system for the medical domain?",
      type: "COLLABORATION" as const,
      status: "NEW" as const,
    },
    {
      name: "Anonymous Reader",
      email: "anon@example.com",
      message:
        "The naive RAG post opened my eyes. Would love a follow-up on production deployment.",
      type: "RESEARCH" as const,
      status: "READ" as const,
    },
    {
      name: "Priya Sharma",
      email: "priya@startup.example",
      message:
        "We're a 3-person team looking for help on an internal RAG over our docs. Timeline 6-8 weeks. Budget around $25k.",
      type: "PROJECT" as const,
      status: "NEW" as const,
    },
    {
      name: "Tobias Wagner",
      email: "tobias@enterprise.example",
      message:
        "How do you handle data residency for clients in the EU? Asking before we kick off a project.",
      type: "GENERAL" as const,
      status: "READ" as const,
    },
    {
      name: "Marketing — Event Attendee",
      email: "events@conference.example",
      message:
        "Would you be interested in giving a talk at our AI Engineering summit in November?",
      type: "OTHER" as const,
      status: "ARCHIVED" as const,
    },
  ]

  for (const feedback of feedbackData) {
    await prisma.feedback.create({ data: feedback })
  }
  console.log(`✅ Created ${feedbackData.length} feedback entries`)

  const briefData = [
    {
      name: "Sari Wijaya",
      email: "sari@retailtech.example",
      company: "RetailTech Indonesia",
      whatsapp: "+62 812 3456 7890",
      service: "AGENTIC_SYSTEM" as const,
      budget: "$15,000 - $30,000",
      timeline: "2-3 months",
      message:
        "Need an internal agent that handles customer order modifications. Connects to our Shopify, our ERP, and our support inbox. The agent should escalate to a human when the change touches a refund or a partial shipment.",
      status: "NEW" as const,
    },
    {
      name: "Budi Santoso",
      email: "budi@logistics.example",
      company: "Nusantara Logistics",
      whatsapp: "+62 813 1111 2222",
      service: "AUTOMATION" as const,
      budget: "$5,000 - $10,000",
      timeline: "4-6 weeks",
      message:
        "We have 12,000 SKUs that need weekly price updates pulled from three supplier portals and pushed to our pricing engine. The current manual process takes two FTEs.",
      status: "REVIEWED" as const,
    },
    {
      name: "Chayanika Das",
      email: "chayanika@fintech.example",
      company: "Bengal Finance",
      whatsapp: null,
      service: "AI_ASSISTANT" as const,
      budget: "$40,000+",
      timeline: "4-6 months",
      message:
        "Looking for a customer-facing assistant that explains our loan products in plain language, in Bahasa Indonesia and English. Must comply with OJK disclosure rules.",
      status: "QUOTED" as const,
    },
  ]

  for (const brief of briefData) {
    await prisma.brief.create({ data: brief })
  }
  console.log(`✅ Created ${briefData.length} briefs`)

  const jobData = [
    {
      slug: "senior-ai-engineer",
      title: "Senior AI Engineer",
      role: "Senior AI Engineer",
      company: "XNINETZY Labs",
      type: "FULL_TIME" as const,
      location: "Remote · APAC timezone overlap",
      description:
        "Own the production agent stack. You'll design, build, and operate the agent systems that go out to real customers. Strong engineering fundamentals required; research background is a plus.",
      requirements:
        "5+ years building production systems. 2+ years working with LLM APIs or fine-tuning. Comfortable owning a deployment end-to-end. Strong opinions about observability.",
      tags: ["TypeScript", "Python", "Agents", "RAG"],
      status: "OPEN" as const,
    },
    {
      slug: "research-engineer-eval",
      title: "Research Engineer · Evaluation",
      role: "Research Engineer",
      company: "XNINETZY Labs",
      type: "CONTRACT" as const,
      location: "Remote",
      description:
        "Lead the open agent eval suite. You'll define benchmarks, run experiments, publish results. The role is hands-on with model APIs and tooling.",
      requirements:
        "Background in ML or empirical CS. Comfort with Python, pytest, and dataset design. Publication track record is a plus but not required.",
      tags: ["Python", "Evaluation", "Agents"],
      status: "OPEN" as const,
    },
    {
      slug: "design-intern",
      title: "Design Intern · Agent Surfaces",
      role: "Design Intern",
      company: "XNINETZY Labs",
      type: "INTERNSHIP" as const,
      location: "Hybrid · Jakarta",
      description:
        "Work directly with the founding designer on the surfaces where humans meet agent output. 3-month paid internship with a clear path to a full-time offer.",
      requirements:
        "Portfolio that shows systems thinking. Bonus for motion work. Available 30+ hours/week.",
      tags: ["Design", "Prototyping"],
      status: "OPEN" as const,
    },
  ]

  for (const job of jobData) {
    await prisma.backgroundJob.create({ data: job })
  }
  console.log(`✅ Created ${jobData.length} open positions`)

  console.log("🎉 Seed complete.")
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
