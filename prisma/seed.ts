import { hashPassword } from "better-auth/crypto"
import { prisma } from "../src/db"

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
  content: items.map((item) => ({
    type: "listItem",
    content: [{ type: "paragraph", content: [{ type: "text", text: item }] }],
  })),
})

const blockquote = (text: string): TiptapNode => ({
  type: "blockquote",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
})

const callout = (text: string): TiptapNode => ({
  type: "blockquote",
  attrs: { class: "callout" },
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
})

const articleLongContextContent = tiptapDoc(
  paragraph(
    "Long-context retrieval is no longer a luxury. As context windows expand to 128k and beyond, the question shifts from how much we can fit to how reliably we can find what matters.",
  ),
  heading(2, "Why naive chunking breaks"),
  paragraph(
    "Naive fixed-size chunking loses structural cues. Tables, code blocks, and section boundaries all get sliced mid-thought. We need semantic chunking that respects the document topology.",
  ),
  bulletList(
    "Use heading + paragraph boundaries as natural splits",
    "Keep code blocks whole when semantically related",
    "Preserve table row relationships when context allows",
  ),
  heading(2, "Embedding strategy"),
  codeBlock(
    "python",
    `from sentence_transformers import SentenceTransformer

model = SentenceTransformer("BAAI/bge-large-en-v1.5")

def chunk_and_embed(text: str, chunk_size: int = 512):
    chunks = semantic_split(text, chunk_size)
    return model.encode(chunks, normalize_embeddings=True)`,
  ),
  callout(
    "Re-ranking is non-optional at scale. Vector recall gives you 100 candidates; a cross-encoder trims that to the 5 that actually matter.",
  ),
  blockquote(
    "The bottleneck is not generation. It is knowing which 5 of 10,000 documents to put in the context window.",
  ),
  paragraph(
    "We tested three configurations on a 50k-document corpus. Re-ranking lifted nDCG@10 from 0.41 to 0.78 — almost double — for under 80ms additional latency.",
  ),
)

const articleNaiveRagContent = tiptapDoc(
  paragraph(
    "Multi-hop questions are where most retrieval-augmented systems fall apart. The reason is structural: single-shot retrieval assumes the answer lives in one passage.",
  ),
  heading(2, "The single-hop assumption"),
  paragraph(
    "Naive RAG retrieves top-k passages, stuffs them in the prompt, and hopes the LLM can answer. For questions that require composing facts across documents, this fails predictably.",
  ),
  bulletList(
    "Question: 'Which CEO of company X previously led company Y's AI division?'",
    "Passage 1 mentions CEO and company X",
    "Passage 2 mentions previous role and company Y",
    "Neither passage alone answers the question",
  ),
  heading(2, "Iterative retrieval"),
  codeBlock(
    "python",
    `def iterative_rag(question: str, max_steps: int = 3):
    context = []
    for step in range(max_steps):
        passages = retrieve(question, context)
        context.extend(passages)
        if can_answer(question, context):
            return synthesize(question, context)
    return synthesize(question, context)`,
  ),
  callout(
    "Each retrieval step rewrites the query conditioned on what we have already found. This is the difference between asking once and asking a sequence of narrowing questions.",
  ),
)

const articleAgenticMemoryContent = tiptapDoc(
  paragraph(
    "Long-running agents accumulate state. Without explicit memory architecture, that state becomes noise. With it, the agent becomes a system that learns.",
  ),
  heading(2, "Three memory layers"),
  bulletList(
    "Working memory: active plan, current sub-tasks, in-flight tool calls",
    "Episodic memory: past trajectories, what worked, what failed",
    "Semantic memory: facts, concepts, relationships between entities",
  ),
  heading(2, "Execution graph"),
  codeBlock(
    "typescript",
    `type ExecutionNode =
  | { kind: "input"; query: string }
  | { kind: "plan"; steps: string[] }
  | { kind: "tool"; name: string; args: unknown }
  | { kind: "memory"; key: string; value: unknown }
  | { kind: "response"; text: string }`,
  ),
  paragraph(
    "Each node carries a state: idle, running, completed, error. Edges animate when execution flows. This is the visual grammar that makes agent behavior legible.",
  ),
)

const articleShrtContent = tiptapDoc(paragraph("Short note placeholder."))

async function main() {
  console.log("🌱 Seeding xninetzy labs database...")

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

  const categories = await Promise.all(
    [
      { slug: "llm", name: "LLM" },
      { slug: "rag", name: "RAG" },
      { slug: "agents", name: "Agents" },
      { slug: "ml", name: "Machine Learning" },
      { slug: "dl", name: "Deep Learning" },
      { slug: "data", name: "Data Intelligence" },
    ].map((category) => prisma.category.create({ data: category })),
  )
  console.log(`✅ Created ${categories.length} categories`)

  const tags = await Promise.all(
    [
      { slug: "engineering", name: "Engineering" },
      { slug: "benchmark", name: "Benchmark" },
      { slug: "deep-dive", name: "Deep Dive" },
      { slug: "experiment", name: "Experiment" },
    ].map((tag) => prisma.tag.create({ data: tag })),
  )
  console.log(`✅ Created ${tags.length} tags`)

  const adminEmail = "admin@xninetzy.local"
  const adminPassword = "XninetzyDev2026!"
  const adminId = `admin_${Date.now().toString(36)}`
  const admin = await prisma.user.create({
    data: {
      id: adminId,
      email: adminEmail,
      name: "Xninetzy Admin",
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
  console.log(`✅ Created admin user (${adminEmail}) — password: ${adminPassword}`)
  console.log("ℹ️  Public signup is disabled — only this seeded admin can sign in.")

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
      coverImage: null,
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
      coverImage: null,
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
      coverImage: null,
    },
    {
      title: "Evaluating Lightweight LLMs for Local Inference",
      slug: "lightweight-llm-local",
      excerpt: "Benchmark notes from running 7B models on consumer hardware. Surprising results.",
      content: articleShrtContent,
      status: "DRAFT" as const,
      publishedAt: null,
      readingTime: 4,
      categorySlug: "llm",
      tagSlugs: ["benchmark", "experiment"],
      coverImage: null,
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
        tags: {
          create: tagSlugs.map((tagSlug) => ({
            tagId: tagBySlug.get(tagSlug)!.id,
          })),
        },
      },
    })
    console.log(`  📄 ${article.title}`)
  }

  const projectsData = [
    {
      title: "Research Agent Runtime",
      slug: "research-agent-runtime",
      description:
        "A production-grade agent framework combining retrieval, planning, and tool execution. Built for long-running research workflows.",
      content: articleAgenticMemoryContent,
      technologies: ["TypeScript", "PostgreSQL", "OpenAI", "TanStack Start", "pgvector"],
      githubUrl: "https://github.com/xninetzy/research-agent-runtime",
      demoUrl: null,
      featured: true,
      order: 1,
      categorySlug: "agents",
    },
    {
      title: "Domain RAG Pipeline",
      slug: "domain-rag-pipeline",
      description:
        "End-to-end retrieval-augmented generation pipeline with semantic chunking, hybrid search, and cross-encoder re-ranking.",
      content: articleLongContextContent,
      technologies: ["Python", "FastAPI", "pgvector", "Qdrant", "Next.js"],
      githubUrl: "https://github.com/xninetzy/domain-rag",
      demoUrl: "https://rag.xninetzy.local",
      featured: true,
      order: 2,
      categorySlug: "rag",
    },
    {
      title: "Engineering Insights Dashboard",
      slug: "engineering-insights-dashboard",
      description:
        "Internal dashboard turning operational metrics into engineering decisions. Connects deploy logs, CI timings, and incident timelines.",
      content: tiptapDoc(
        paragraph(
          "A lightweight analytics layer that sits between our CI/CD output and our weekly engineering review. Pulls deploy frequency, MTTR, change failure rate, and ties them to individual service ownership.",
        ),
        bulletList(
          "Live deploy feed with rollback annotations",
          "Service ownership matrix auto-generated from CODEOWNERS",
          "Incident timeline with paged incident retros",
        ),
      ),
      technologies: ["TanStack Start", "PostgreSQL", "ClickHouse", "Tremor"],
      githubUrl: null,
      demoUrl: null,
      featured: true,
      order: 3,
      categorySlug: "data",
    },
    {
      title: "Open Agent Eval Suite",
      slug: "open-agent-eval",
      description:
        "Open-source evaluation harness for tool-using agents. Tracks pass-rate, tool-call efficiency, and recovery from errors.",
      content: tiptapDoc(paragraph("Open agent eval framework — open-sourced under Apache 2.0.")),
      technologies: ["Python", "pytest", "Docker"],
      githubUrl: "https://github.com/xninetzy/agent-eval",
      demoUrl: null,
      featured: false,
      order: 4,
      categorySlug: "agents",
    },
  ]

  for (const projectData of projectsData) {
    const { categorySlug, ...rest } = projectData
    const project = await prisma.project.create({
      data: {
        ...rest,
        categoryId: categoryBySlug.get(categorySlug)?.id,
      },
    })
    console.log(`  🚀 ${project.title}`)
  }

  const teamData = [
    {
      name: "Misbahul Muttaqin",
      role: "Founder · AI Engineer",
      bio: "Builds agentic systems and the tools that make them observable. Believes research artifacts should ship.",
      avatar: null,
      github: "https://github.com/misbah-muttaqin",
      linkedin: null,
      website: "https://xninetzy.local",
      featured: true,
      order: 1,
    },
    {
      name: "Collaborator A",
      role: "Research Engineer",
      bio: "Works on retrieval pipelines and evaluation methodology. Focused on long-context efficiency.",
      avatar: null,
      github: null,
      linkedin: null,
      website: null,
      featured: true,
      order: 2,
    },
    {
      name: "Collaborator B",
      role: "Systems Engineer",
      bio: "Operates the data layer. Loves Postgres, hates query plans.",
      avatar: null,
      github: null,
      linkedin: null,
      website: null,
      featured: true,
      order: 3,
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
  ]

  for (const feedback of feedbackData) {
    await prisma.feedback.create({ data: feedback })
  }
  console.log(`✅ Created ${feedbackData.length} feedback entries`)

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
