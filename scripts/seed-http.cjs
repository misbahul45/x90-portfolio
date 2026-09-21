// Standalone seed that uses @neondatabase/serverless HTTP gateway directly.
// Bypasses Prisma entirely so we don't hit the HTTP-adapter transaction
// limitation. Reads DATABASE_URL from .env.local (no .env reading here to
// avoid leaking the URL into the script's persistent form — caller passes it
// via env).
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const dns = require("node:dns");
const { Agent, setGlobalDispatcher } = require("undici");
dns.setDefaultResultOrder("ipv4first");
setGlobalDispatcher(new Agent({ connect: { family: 4 } }));

const env = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const { neon } = require("@neondatabase/serverless");
const sql = neon(url);

const cuids = () =>
  Array.from({ length: 16 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[
    Math.floor(Math.random() * 36)
  ]).join("");
const cuid = () => "c" + cuids().slice(0, 24);

async function hashPassword(plain) {
  const m = await import("better-auth/crypto");
  return m.hashPassword(plain);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function tableEmpty(name) {
  const r = await sql.query(`SELECT COUNT(*)::int AS c FROM "${name}"`);
  return r[0].c === 0;
}

async function clearAll() {
  // Order matters: child rows before parents.
  for (const t of [
    "project_research",
    "feedback",
    "brief",
    "background_job",
    "uploaded_file",
    "tag_on_article",
    "article",
    "project",
    "team_member",
    "tag",
    "category",
    "session",
    "account",
    "verification",
    '"user"',
  ]) {
    try {
      await sql.query(`DELETE FROM ${t}`);
    } catch (e) {
      console.warn("clear", t, e.message);
    }
  }
}

async function run() {
  const dbOk = await sql
    .query("SELECT 1 AS ok")
    .then(() => true)
    .catch((e) => {
      console.error("DB ping failed:", e.message);
      return false;
    });
  if (!dbOk) {
    process.exit(1);
  }
  console.log("✅ DB reachable");

  console.log("🧹 Clearing existing data…");
  await clearAll();

  // ---- Categories ----
  const categoryRows = [
    { slug: "llm", name: "LLM" },
    { slug: "rag", name: "RAG" },
    { slug: "agents", name: "Agents" },
    { slug: "ml", name: "Machine Learning" },
    { slug: "dl", name: "Deep Learning" },
    { slug: "data", name: "Data Intelligence" },
  ];
  const categoryIdBySlug = {};
  for (const c of categoryRows) {
    const id = cuid();
    categoryIdBySlug[c.slug] = id;
    await sql.query(
      `INSERT INTO "category" (id, slug, name, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, now(), now())`,
      [id, c.slug, c.name],
    );
  }
  console.log(`✅ ${categoryRows.length} categories`);

  // ---- Tags ----
  const tagRows = [
    { slug: "engineering", name: "Engineering" },
    { slug: "benchmark", name: "Benchmark" },
    { slug: "deep-dive", name: "Deep Dive" },
    { slug: "experiment", name: "Experiment" },
    { slug: "production", name: "Production" },
    { slug: "tooling", name: "Tooling" },
  ];
  const tagIdBySlug = {};
  for (const t of tagRows) {
    const id = cuid();
    tagIdBySlug[t.slug] = id;
    await sql.query(
      `INSERT INTO "tag" (id, slug, name, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, now(), now())`,
      [id, t.slug, t.name],
    );
  }
  console.log(`✅ ${tagRows.length} tags`);

  // ---- Admin user + account ----
  const adminEmail = "xninetzy@gmail.com";
  const adminPassword = "xninetzy123";
  const adminName = "Xninetzy Admin";
  const userId = cuid();
  await sql.query(
    `INSERT INTO "user" (id, name, email, "emailVerified", role, "image", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, true, 'ADMIN', NULL, now(), now())`,
    [userId, adminName, adminEmail],
  );
  const password = await hashPassword(adminPassword);
  await sql.query(
    `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
     VALUES ($1, $2, 'credential', $3, $4, now(), now())`,
    [cuid(), userId, userId, password],
  );
  console.log(`✅ Admin user ${adminEmail}`);

  // ---- Articles ----
  const articleRows = [
    {
      title: "Building Long-Context Retrieval Systems for Domain Knowledge",
      slug: "building-long-context-rag",
      excerpt:
        "Chunking, embedding, re-ranking — a practical pipeline for getting the right 5 passages out of 50,000 documents.",
      readingTime: 8,
      categorySlug: "rag",
      tagSlugs: ["engineering", "deep-dive"],
      publishedAt: "2026-09-08T00:00:00Z",
      status: "PUBLISHED",
      coverImage:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=70",
    },
    {
      title: "Why Naive RAG Breaks on Multi-Hop Questions",
      slug: "why-naive-rag-fails",
      excerpt:
        "Single-shot retrieval assumes the answer is in one place. Real questions usually aren't.",
      readingTime: 6,
      categorySlug: "rag",
      tagSlugs: ["engineering", "benchmark"],
      publishedAt: "2026-09-04T00:00:00Z",
      status: "PUBLISHED",
      coverImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=70",
    },
    {
      title: "Designing Tool-Using Agents with Execution Graphs",
      slug: "designing-tool-agents",
      excerpt:
        "Memory, planning, tools, and reasoning — the four nodes every serious agent needs, and how to wire them.",
      readingTime: 10,
      categorySlug: "agents",
      tagSlugs: ["deep-dive", "experiment"],
      publishedAt: "2026-08-29T00:00:00Z",
      status: "PUBLISHED",
      coverImage:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=70",
    },
    {
      title: "Observability for Agent Systems: Trace Schema and Eval Loop",
      slug: "agent-observability-traces",
      excerpt:
        "Tool calls, planning steps, model invocations — what you instrument, what you score, what you store.",
      readingTime: 7,
      categorySlug: "agents",
      tagSlugs: ["engineering", "production"],
      publishedAt: "2026-08-20T00:00:00Z",
      status: "PUBLISHED",
      coverImage:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=70",
    },
    {
      title: "From Notebook to Production: Three Stops on the Agent Path",
      slug: "notebook-to-production",
      excerpt:
        "Determinism, bounded resources, schema validation. The non-negotiable checklist before shipping an agent.",
      readingTime: 9,
      categorySlug: "agents",
      tagSlugs: ["production", "engineering"],
      publishedAt: "2026-08-12T00:00:00Z",
      status: "PUBLISHED",
      coverImage:
        "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=70",
    },
    {
      title: "Evaluating Lightweight LLMs for Local Inference",
      slug: "lightweight-llm-local",
      excerpt: "Benchmark notes from running 7B models on consumer hardware. Surprising results.",
      readingTime: 6,
      categorySlug: "llm",
      tagSlugs: ["benchmark", "experiment"],
      publishedAt: "2026-08-05T00:00:00Z",
      status: "PUBLISHED",
      coverImage:
        "https://images.unsplash.com/photo-1620712943543-2858200f7426?auto=format&fit=crop&w=1600&q=70",
    },
    {
      title: "Embedding Model Upgrades Without Downtime",
      slug: "embedding-upgrade-pattern",
      excerpt:
        "When the embedding model improves, your vectors are now invalid. Here's the migration pattern we use.",
      readingTime: 5,
      categorySlug: "llm",
      tagSlugs: ["engineering", "production"],
      publishedAt: "2026-07-22T00:00:00Z",
      status: "PUBLISHED",
      coverImage:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=70",
    },
    {
      title: "The Cost of Hallucinations in Production",
      slug: "cost-of-hallucinations",
      excerpt:
        "We instrumented every claim our public assistant made. 6.4% were unsupported. Here's what we learned.",
      readingTime: 6,
      categorySlug: "llm",
      tagSlugs: ["benchmark", "production"],
      publishedAt: null,
      status: "DRAFT",
      coverImage:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=70",
    },
  ];

  // Simple tip-tap doc
  const tiptapDoc = (paragraphs) =>
    JSON.stringify({
      type: "doc",
      content: paragraphs.map((p) =>
        typeof p === "string"
          ? { type: "paragraph", content: [{ type: "text", text: p }] }
          : p,
      ),
    });

  const articleIdBySlug = {};
  for (const a of articleRows) {
    const id = cuid();
    articleIdBySlug[a.slug] = id;
    await sql.query(
      `INSERT INTO "article"
       (id, title, slug, excerpt, content, "coverImage", status, "publishedAt",
        "readingTime", "categoryId", "authorId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7::"ArticleStatus",$8::timestamptz,$9::int,$10,$11,now(),now())`,
      [
        id,
        a.title,
        a.slug,
        a.excerpt,
        tiptapDoc([
          `This is a research note on ${a.title.toLowerCase()}.`,
          `We explore the practical implications and ship a working artifact at the end of every writeup.`,
        ]),
        a.coverImage,
        a.status,
        a.publishedAt,
        a.readingTime,
        categoryIdBySlug[a.categorySlug],
        userId,
      ],
    );
    for (const tagSlug of a.tagSlugs) {
      await sql.query(
        `INSERT INTO "tag_on_article" ("articleId", "tagId") VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [id, tagIdBySlug[tagSlug]],
      );
    }
    console.log(`  📄 ${a.title}`);
  }

  // ---- Projects ----
  const projectRows = [
    {
      title: "Research Agent Runtime",
      slug: "research-agent-runtime",
      description:
        "A production-grade agent framework combining retrieval, planning, and tool execution. Built for long-running research workflows that survive context-window limits.",
      technologies: ["TypeScript", "PostgreSQL", "OpenAI", "TanStack Start", "pgvector"],
      githubUrl: "https://github.com/xninetzy/research-agent-runtime",
      demoUrl: "https://research-agent.xninetzy.local",
      featured: true,
      order: 1,
      categorySlug: "agents",
      coverImage:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=70",
      daysAgo: 3,
    },
    {
      title: "Domain RAG Pipeline",
      slug: "domain-rag-pipeline",
      description:
        "End-to-end retrieval-augmented generation with semantic chunking, hybrid search, and cross-encoder re-ranking. Tuned for technical documentation.",
      technologies: ["Python", "FastAPI", "pgvector", "Qdrant", "Next.js", "Cohere"],
      githubUrl: "https://github.com/xninetzy/domain-rag",
      demoUrl: "https://rag.xninetzy.local",
      featured: true,
      order: 2,
      categorySlug: "rag",
      coverImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=70",
      daysAgo: 10,
    },
    {
      title: "Engineering Insights Dashboard",
      slug: "engineering-insights-dashboard",
      description:
        "Internal dashboard turning operational metrics into engineering decisions. Connects deploy logs, CI timings, and incident timelines into one weekly review.",
      technologies: ["TanStack Start", "PostgreSQL", "ClickHouse", "Tremor"],
      githubUrl: null,
      demoUrl: "https://insights.xninetzy.local",
      featured: true,
      order: 3,
      categorySlug: "data",
      coverImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=70",
      daysAgo: 17,
    },
    {
      title: "Open Agent Eval Suite",
      slug: "open-agent-eval",
      description:
        "Open-source evaluation harness for tool-using agents. Tracks pass-rate, tool-call efficiency, and recovery from errors.",
      technologies: ["Python", "pytest", "Docker", "GitHub Actions"],
      githubUrl: "https://github.com/xninetzy/agent-eval",
      demoUrl: null,
      featured: false,
      order: 4,
      categorySlug: "agents",
      coverImage:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=70",
      daysAgo: 25,
    },
    {
      title: "Local LLM Inference Gateway",
      slug: "local-llm-gateway",
      description:
        "OpenAI-compatible gateway that routes between local models and cloud APIs based on cost, latency, and capability tiers. Single interface, multiple backends.",
      technologies: ["Go", "Ollama", "OpenAI API", "Anthropic API", "Redis"],
      githubUrl: "https://github.com/xninetzy/llm-gateway",
      demoUrl: "https://gateway.xninetzy.local",
      featured: true,
      order: 5,
      categorySlug: "llm",
      coverImage:
        "https://images.unsplash.com/photo-1620712943543-2858200f7426?auto=format&fit=crop&w=1600&q=70",
      daysAgo: 32,
    },
    {
      title: "Vector Migration Toolkit",
      slug: "vector-migration-toolkit",
      description:
        "Reusable migration tooling for upgrading embedding models without downtime. Dual-write, lazy re-embed, fallback chain.",
      technologies: ["TypeScript", "Postgres", "pgvector", "BullMQ"],
      githubUrl: "https://github.com/xninetzy/vector-migration",
      demoUrl: null,
      featured: false,
      order: 6,
      categorySlug: "llm",
      coverImage:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=70",
      daysAgo: 40,
    },
    {
      title: "Conversational Brief Intake",
      slug: "conversational-brief-intake",
      description:
        "Production Ask Labs intake — turns natural-language project briefs into structured project records. Routes to the right team automatically.",
      technologies: ["TanStack Start", "OpenAI", "Flazz API", "Postgres"],
      githubUrl: null,
      demoUrl: "https://xninetzy.local/ask-labs",
      featured: true,
      order: 7,
      categorySlug: "agents",
      coverImage:
        "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1600&q=70",
      daysAgo: 50,
    },
  ];

  const projectIdBySlug = {};
  for (const p of projectRows) {
    const id = cuid();
    projectIdBySlug[p.slug] = id;
    const publishedAt = new Date(Date.now() - p.daysAgo * 86400e3).toISOString();
    await sql.query(
      `INSERT INTO "project"
       (id, title, slug, description, content, "coverImage", technologies,
        "categoryId", "githubUrl", "demoUrl", featured, "order", status,
        "publishedAt", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7::text[],$8::text,$9,$10,$11::bool,$12::int,
               'PUBLISHED',$13::timestamptz,now(),now())`,
      [
        id,
        p.title,
        p.slug,
        p.description,
        tiptapDoc([p.description, "Built and maintained by the XNINETZY Labs team."]),
        p.coverImage,
        p.technologies,
        categoryIdBySlug[p.categorySlug],
        p.githubUrl,
        p.demoUrl,
        p.featured,
        p.order,
        publishedAt,
      ],
    );
    console.log(`  🚀 ${p.title}`);
  }

  // ---- Project ↔ Article relations ----
  const relations = [
    ["research-agent-runtime", "designing-tool-agents"],
    ["research-agent-runtime", "agent-observability-traces"],
    ["domain-rag-pipeline", "building-long-context-rag"],
    ["domain-rag-pipeline", "why-naive-rag-fails"],
    ["engineering-insights-dashboard", "notebook-to-production"],
    ["open-agent-eval", "agent-observability-traces"],
    ["local-llm-gateway", "lightweight-llm-local"],
    ["local-llm-gateway", "notebook-to-production"],
    ["vector-migration-toolkit", "embedding-upgrade-pattern"],
    ["conversational-brief-intake", "cost-of-hallucinations"],
  ];
  for (const [projectSlug, articleSlug] of relations) {
    const pid = projectIdBySlug[projectSlug]
    const aid = articleIdBySlug[articleSlug]
    if (!pid || !aid) continue
    await sql.query(
      `INSERT INTO "project_research" ("projectId", "articleId", relation, "createdAt")
       VALUES ($1, $2, 'related', now())
       ON CONFLICT DO NOTHING`,
      [pid, aid],
    )
  }
  console.log(`✅ ${relations.length} project↔article relations`)

  // ---- Team ----
  const teamRows = [
    {
      name: "Misbahul Muttaqin",
      role: "Founder · AI Engineer",
      bio: "Builds agentic systems and the tools that make them observable. Believes research artifacts should ship, not sit in notebooks.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=70",
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
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=70",
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
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=70",
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
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=70",
      github: null,
      linkedin: "https://www.linkedin.com/in/xninetzy",
      website: null,
      featured: true,
      order: 4,
    },
  ];
  for (const t of teamRows) {
    await sql.query(
      `INSERT INTO "team_member"
       (id, name, role, bio, avatar, github, linkedin, website, featured, "order",
        "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::bool,$10::int,now(),now())`,
      [
        cuid(),
        t.name,
        t.role,
        t.bio,
        t.avatar,
        t.github,
        t.linkedin,
        t.website,
        t.featured,
        t.order,
      ],
    );
    console.log(`  👤 ${t.name}`);
  }

  // ---- Feedback ----
  const feedbackRows = [
    {
      name: "A Curious Visitor",
      email: "visitor@example.com",
      message: "Loved the research-agent writeup. Are you open to collaborating on a similar system for the medical domain?",
      type: "COLLABORATION",
      status: "NEW",
    },
    {
      name: "Anonymous Reader",
      email: "anon@example.com",
      message: "The naive RAG post opened my eyes. Would love a follow-up on production deployment.",
      type: "RESEARCH",
      status: "READ",
    },
    {
      name: "Priya Sharma",
      email: "priya@startup.example",
      message: "We're a 3-person team looking for help on an internal RAG over our docs. Timeline 6-8 weeks. Budget around $25k.",
      type: "PROJECT",
      status: "NEW",
    },
    {
      name: "Tobias Wagner",
      email: "tobias@enterprise.example",
      message: "How do you handle data residency for clients in the EU? Asking before we kick off a project.",
      type: "GENERAL",
      status: "READ",
    },
    {
      name: "Marketing — Event Attendee",
      email: "events@conference.example",
      message: "Would you be interested in giving a talk at our AI Engineering summit in November?",
      type: "OTHER",
      status: "ARCHIVED",
    },
  ];
  for (const f of feedbackRows) {
    await sql.query(
      `INSERT INTO "feedback" (id, name, email, message, type, status, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5::"FeedbackType",$6::"FeedbackStatus",now(),now())`,
      [cuid(), f.name, f.email, f.message, f.type, f.status],
    );
  }
  console.log(`✅ ${feedbackRows.length} feedback entries`);

  // ---- Briefs ----
  const briefRows = [
    {
      name: "Sari Wijaya",
      email: "sari@retailtech.example",
      company: "RetailTech Indonesia",
      whatsapp: "+62 812 3456 7890",
      service: "AGENTIC_SYSTEM",
      budget: "$15,000 - $30,000",
      timeline: "2-3 months",
      message:
        "Need an internal agent that handles customer order modifications. Connects to our Shopify, our ERP, and our support inbox. The agent should escalate to a human when the change touches a refund or a partial shipment.",
      status: "NEW",
    },
    {
      name: "Budi Santoso",
      email: "budi@logistics.example",
      company: "Nusantara Logistics",
      whatsapp: "+62 813 1111 2222",
      service: "AUTOMATION",
      budget: "$5,000 - $10,000",
      timeline: "4-6 weeks",
      message:
        "We have 12,000 SKUs that need weekly price updates pulled from three supplier portals and pushed to our pricing engine. The current manual process takes two FTEs.",
      status: "REVIEWED",
    },
    {
      name: "Chayanika Das",
      email: "chayanika@fintech.example",
      company: "Bengal Finance",
      whatsapp: null,
      service: "AI_ASSISTANT",
      budget: "$40,000+",
      timeline: "4-6 months",
      message:
        "Looking for a customer-facing assistant that explains our loan products in plain language, in Bahasa Indonesia and English. Must comply with OJK disclosure rules.",
      status: "QUOTED",
    },
  ];
  for (const b of briefRows) {
    await sql.query(
      `INSERT INTO "brief"
       (id, name, email, company, whatsapp, service, budget, timeline, message,
        status, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6::"BriefService",$7,$8,$9,$10::"BriefStatus",now(),now())`,
      [
        cuid(),
        b.name,
        b.email,
        b.company,
        b.whatsapp,
        b.service,
        b.budget,
        b.timeline,
        b.message,
        b.status,
      ],
    );
  }
  console.log(`✅ ${briefRows.length} briefs`);

  // ---- Open positions ----
  const jobRows = [
    {
      slug: "senior-ai-engineer",
      title: "Senior AI Engineer",
      role: "Senior AI Engineer",
      company: "XNINETZY Labs",
      type: "FULL_TIME",
      location: "Remote · APAC timezone overlap",
      description:
        "Own the production agent stack. You'll design, build, and operate the agent systems that go out to real customers. Strong engineering fundamentals required; research background is a plus.",
      requirements:
        "5+ years building production systems. 2+ years working with LLM APIs or fine-tuning. Comfortable owning a deployment end-to-end. Strong opinions about observability.",
      tags: ["TypeScript", "Python", "Agents", "RAG"],
      status: "OPEN",
    },
    {
      slug: "research-engineer-eval",
      title: "Research Engineer · Evaluation",
      role: "Research Engineer",
      company: "XNINETZY Labs",
      type: "CONTRACT",
      location: "Remote",
      description:
        "Lead the open agent eval suite. You'll define benchmarks, run experiments, publish results. The role is hands-on with model APIs and tooling.",
      requirements:
        "Background in ML or empirical CS. Comfort with Python, pytest, and dataset design. Publication track record is a plus but not required.",
      tags: ["Python", "Evaluation", "Agents"],
      status: "OPEN",
    },
    {
      slug: "design-intern",
      title: "Design Intern · Agent Surfaces",
      role: "Design Intern",
      company: "XNINETZY Labs",
      type: "INTERNSHIP",
      location: "Hybrid · Jakarta",
      description:
        "Work directly with the founding designer on the surfaces where humans meet agent output. 3-month paid internship with a clear path to a full-time offer.",
      requirements:
        "Portfolio that shows systems thinking. Bonus for motion work. Available 30+ hours/week.",
      tags: ["Design", "Prototyping"],
      status: "OPEN",
    },
  ];
  for (const j of jobRows) {
    await sql.query(
      `INSERT INTO "background_job"
       (id, slug, title, role, company, type, location, description, requirements,
        tags, status, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6::"BackgroundJobType",$7,$8,$9,$10::text[],
               $11::"BackgroundJobStatus",now(),now())`,
      [
        cuid(),
        j.slug,
        j.title,
        j.role,
        j.company,
        j.type,
        j.location,
        j.description,
        j.requirements,
        j.tags,
        j.status,
      ],
    );
  }
  console.log(`✅ ${jobRows.length} open positions`);

  console.log("🎉 Seed complete.");
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
