# XNINETZY LABS — Platform Design

> **Status**: Draft for review
> **Date**: 2026-09-10
> **Author**: xninetzy primary orchestrator
> **Scope**: Brand, information architecture, data model, visual language, tech stack, engineering standards, phasing
> **Implementation Plan**: `docs/superpowers/plans/2026-09-10-xninetzy-labs-platform-plan.md`

---

## 1. Brand & Positioning

### 1.1 One-liner

> **A technical AI lab that turns experiments, research, and engineering into useful systems.**

### 1.2 Three pillars (brand has three faces that reinforce each other)

| Pillar | What it covers |
|--------|----------------|
| **RESEARCH** | ML/DL/LLM experiments, RAG, agentic systems, technical writing, benchmarks, datasets |
| **BUILD** | AI automation, web/app, AI assistants, agentic systems, data analysis/intelligence |
| **COMMUNITY** | Team, projects, feedback loop, knowledge sharing |

### 1.3 Tagline

> **Research. Experiment. Build.**

### 1.4 Voice

- Concise, technical, not corporate.
- "Show, don't tell" — every claim backed by visible artifact (article, project, code, graph).
- No Lorem Ipsum, no agency-cliché copy.

### 1.5 Visual DNA (4-source composite, NOT cloned)

| Source | Take from it |
|--------|--------------|
| **xAI** | Dark technical interface, terminal/code aesthetic, demo as proof, "show don't tell" |
| **Mistral** | Editorial layout, whitespace, premium typography, service-vs-product positioning |
| **DeepMind** | Research storytelling, cinematic visualization, scientific tone, large visual moments |
| **Hugging Face** | Community feel, living content, latest research, contributors, metrics |

---

## 2. Information Architecture

### 2.1 Public sitemap

```
/
├── /                       (Editorial homepage — 11 sections)
├── /research               (Article index, filterable by category)
├── /research/[slug]        (Article detail, editorial typography)
├── /projects               (Project showcase index)
├── /projects/[slug]        (Project case-study detail)
└── /about                  (Team + manifesto)
```

Global: **Floating AI Button** (bottom-right) → opens **AIAssistantDialog** as overlay. NO `/chat` route.

### 2.2 Admin sitemap (Better Auth protected)

```
/admin
├── /admin                  (Overview dashboard — counts + recent activity)
├── /admin/articles
│   ├── /admin/articles         (List: All / Drafts / Published)
│   ├── /admin/articles/new     (Tiptap editor — new)
│   └── /admin/articles/[id]    (Tiptap editor — edit)
├── /admin/projects
├── /admin/team
└── /admin/feedback
```

### 2.3 Homepage sections (in order)

1. **Header** — sticky, transparent → bordered on scroll, mobile drawer
2. **Hero** — "Research. Experiment. Build." + interactive TerminalShowcase
3. **Research Signal** — topic ticker (LLM / RAG / AGENTS / ML / DL / DATA) with activity visualization
4. **What We Build** — 5 capability cards (AI Automation, Web & App, Agentic Systems, AI Assistants, Data Intelligence) with mini architecture diagrams
5. **Inside the System** — ArchitectureGraph (React Flow) showing agent execution flow with stateful nodes
6. **Selected Projects** — featured project cards from DB (case-study preview)
7. **Latest Research** — recent published articles (editorial layout)
8. **Team** — featured team members (human, not corporate)
9. **Feedback** — submission form (persisted) + recent feedback wall
10. **Final CTA** — "Have a problem worth engineering?"
11. **Footer**

Plus: **Floating AI Button** mounted at root layout level.

### 2.4 Information principle

```
Show what we think → show what we build → show what we've built → show what we learn
```

NOT: `About → Vision → Mission → Services → Testimonials → Contact`

---

## 3. Data Model

### 3.1 Existing foundation

- **Better Auth** wired (`src/lib/auth.ts`, route handler `src/routes/api/auth/$.ts`) — REUSE
- **Prisma + PostgreSQL** via Docker (`pgvector/pgvector:pg16`) — REUSE
- **TanStack Start** SSR-ready — REUSE
- **shadcn/ui** primitives — REUSE

### 3.2 New models (added on top of existing)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  role      UserRole @default(READER)
  createdAt DateTime @default(now())

  articles  Article[]
  sessions  Session[]
  accounts  Account[]
}

enum UserRole {
  READER
  EDITOR
  ADMIN
}

model Article {
  id          String        @id @default(cuid())
  title       String
  slug        String        @unique
  excerpt     String
  content     String        // JSON from Tiptap
  coverImage  String?
  status      ArticleStatus @default(DRAFT)
  publishedAt DateTime?
  readingTime Int?
  categoryId  String?
  authorId    String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  author   User       @relation(fields: [authorId], references: [id])
  category Category?  @relation(fields: [categoryId], references: [id])
  tags     TagOnArticle[]
  embedding Unsupported("vector(1536)")?

  @@index([status, publishedAt])
  @@index([slug])
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Project {
  id           String   @id @default(cuid())
  title        String
  slug         String   @unique
  description  String
  content      String   // JSON from Tiptap
  coverImage   String?
  categoryId   String?
  technologies String[] // Postgres array
  githubUrl    String?
  demoUrl      String?
  featured     Boolean  @default(false)
  order        Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  category Category? @relation(fields: [categoryId], references: [id])
}

model TeamMember {
  id        String   @id @default(cuid())
  name      String
  role      String
  bio       String?
  avatar    String?
  github    String?
  linkedin  String?
  website   String?
  featured  Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Feedback {
  id        String         @id @default(cuid())
  name      String
  email     String
  message   String
  type      FeedbackType   @default(GENERAL)
  status    FeedbackStatus @default(NEW)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
}

enum FeedbackType {
  GENERAL
  PROJECT
  RESEARCH
  COLLABORATION
  OTHER
}

enum FeedbackStatus {
  NEW
  READ
  ARCHIVED
}

model Category {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  createdAt DateTime @default(now())

  articles Article[]
  projects Project[]
}

model Tag {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  createdAt DateTime @default(now())

  articles TagOnArticle[]
}

model TagOnArticle {
  articleId String
  tagId     String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([articleId, tagId])
}
```

### 3.3 Better Auth tables (generated via CLI)

```prisma
model Session { /* better-auth managed */ }
model Account { /* better-auth managed */ }
model Verification { /* better-auth managed */ }
```

### 3.4 pgvector

- `Article.embedding` is `Unsupported("vector(1536)")?` (Prisma 7 doesn't natively support vector).
- All vector ops via `prisma.$queryRaw`.
- Activation deferred to Phase 2 (after core platform is shipped).

### 3.5 Centralized domain constants

Per engineering standard §36.1, no magic strings:

```ts
// src/lib/domain/article-status.ts
export const ARTICLE_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

// src/lib/domain/user-role.ts
export const USER_ROLE = { READER: "READER", EDITOR: "EDITOR", ADMIN: "ADMIN" } as const;

// src/lib/domain/feedback.ts
export const FEEDBACK_TYPE = { GENERAL: "GENERAL", PROJECT: "PROJECT", ... } as const;
export const FEEDBACK_STATUS = { NEW: "NEW", READ: "READ", ARCHIVED: "ARCHIVED" } as const;

// src/lib/domain/routes.ts
export const ROUTES = {
  HOME: "/",
  RESEARCH: "/research",
  RESEARCH_DETAIL: (slug: string) => `/research/${slug}` as const,
  PROJECTS: "/projects",
  PROJECTS_DETAIL: (slug: string) => `/projects/${slug}` as const,
  ABOUT: "/about",
  ADMIN: "/admin",
  ADMIN_ARTICLES: "/admin/articles",
  ...
} as const;
```

---

## 4. Visual Language

### 4.1 Palette (already implemented in `src/styles.css`)

Light mode (brand):
- `--background: #f8f7f4` (Warm White)
- `--foreground: #102a43` (Dark Blue)
- `--primary: #062b4f` (Navy — structure/authority)
- `--accent: #d85b18` (Orange — AI/energy/action)
- `--secondary: #eef1f4`
- `--muted: #f1f3f5`
- `--muted-foreground: #526579`
- `--border: #d9e0e6`
- `--ring: #d85b18`
- `--destructive: #dc2626`

Dark mode (deep navy + orange):
- `--background: #0a1628` (deep navy — brand structure)
- `--foreground: #f0ece4` (warm off-white)
- `--primary: #f0ece4`
- `--primary-foreground: #062b4f`
- `--secondary: #1a2d44`
- `--accent: #d85b18`
- `--border: #1f3349`

Chart palette: `#d85b18` `#062b4f` `#b95428` `#e8752f` `#526579` (light) / `#f2762a` `#5b8def` `#d85b18` `#ffae5c` `#94a3b8` (dark).

### 4.2 Typography

- Display: `Fraunces` (already loaded — editorial, serif)
- UI / body: `Manrope` (already loaded — sans)
- Mono: `JetBrains Mono` (new — for terminal/code/system status) — add via Google Fonts in `src/styles.css`

Hierarchy:
- Display (Fraunces, 64–96px, bold)
- Heading (Manrope, 32–48px, semibold)
- Subheading (Manrope, 20–24px, medium)
- Body (Manrope, 16–18px, regular)
- Metadata (Manrope, 12–14px, medium, letter-spacing)
- Code/Mono (JetBrains Mono, 13–15px)

### 4.3 Layout principles

- Editorial composition, NOT SaaS template.
- Generous whitespace, content-led.
- 12-col grid on desktop, 1-col on mobile.
- Asymmetric hero with TerminalShowcase on right (desktop), stacked on mobile.
- React Flow degrades to vertical architecture on mobile.

### 4.4 Motion principles

Use **Motion** (Framer Motion successor). NOT every element animates. Animation has narrative purpose:

| Element | Animation |
|---------|-----------|
| Hero text | Staggered reveal, "RESEARCH / EXPERIMENT / BUILD" type-writer effect |
| TerminalShowcase | Streaming cursor, line-by-line output reveal |
| CapabilityCard | On hover: architecture diagram fade-in + node pulse |
| ArchitectureGraph | Idle → running → completed state transition; animated edges |
| ProjectCard | On scroll-in: subtle parallax; metadata reveal on hover |
| ResearchCard | On scroll-in: rise-in + arrow slide |
| Page transition | opacity + clip-path |
| Floating AI button | Subtle scale on hover, pulse on idle |

Respect `prefers-reduced-motion`.

### 4.5 Accessibility

- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<article>`, `<section>`, `<footer>`).
- ARIA only where semantics insufficient (dialog, navigation drawer, live regions).
- Focus management on dialogs (trap, restore).
- Keyboard: Escape closes dialog/drawer, Tab navigates, Enter activates.
- Color contrast ≥ 4.5:1 for body text; tested in both modes.
- Image alt text mandatory.
- Form labels + descriptions + error messages.
- Reduced motion support throughout.

---

## 5. Tech Stack

### 5.1 Existing (REUSE)

- TanStack Start + Router (file-based) + Query + Form + Table
- React 19, TypeScript strict
- Vite 7, Tailwind 4, shadcn/ui (new-york / zinc / lucide)
- Prisma 7 + PostgreSQL 16 + pgvector
- Better Auth
- T3Env, dotenv-cli
- Zod 4
- lucide-react

### 5.2 New (to install — approved by owner)

- `motion` — animation (Framer Motion successor, official Motion package)
- `@xyflow/react` — React Flow for ArchitectureGraph
- `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-code-block-lowlight`, `lowlight` — Tiptap editor
- shadcn components: `dialog`, `sheet`, `dropdown-menu`, `navigation-menu`, `separator`, `tabs`, `skeleton`, `badge`, `card`, `avatar`, `scroll-area`, `tooltip`, `sonner`, `progress`, `popover`, `accordion`

### 5.3 Deferred (NOT in Phase 1)

- ImageKit (use local upload to `/public/uploads` for now; swap later without schema change)
- AI Chat backend (Phase 2; for now Floating AI dialog is UI-only with simulated execution state)
- Vector search (Phase 2; pgvector extension already enabled)

---

## 6. Engineering Standards (Summary)

Full detail in implementation plan. Highlights:

| # | Standard | Rule |
|---|----------|------|
| 36.1 | No magic strings | Centralize route names, statuses, categories, query keys, role names |
| 36.2 | Strict TypeScript | No `any`, no unsafe casts, inferred where safe, explicit at boundaries |
| 36.3 | Custom hooks | One responsibility; do not create 1-line hooks; do not bundle fetching+UI state |
| 36.4 | TanStack Query | Server state via Query/Mutation; query key factories; no `useEffect+fetch` for server state |
| 36.5 | Typed API client | UI → hook → Query → API client → server function |
| 36.6 | Zod validation | All form inputs, API inputs, server-side validation, query params |
| 36.7 | Form architecture | `@tanstack/react-form` + Zod; loading/success/error states |
| 36.8 | Clean components | One responsibility; compose, don't monolith |
| 36.9 | Server/client boundaries | Server-render data fetching; client only for interactivity |
| 36.10 | Database access | Service layer; UI never imports `prisma` |
| 36.11 | Error handling | loading/empty/success/error states intentional |
| 36.12 | Loading states | Skeletons, execution state, streaming; not generic "Loading…" |
| 36.13 | No duplicated logic | Slug gen, validation, query keys, formatting centralized |
| 36.14 | Code style | Formatter + lint + typecheck + test + build pass |
| 36.15 | Comments | Explain WHY, not WHAT. (Per AGENTS.md: NO comments in code.) |
| 36.16 | Accessibility | Labels, focus management, semantic HTML |
| 36.17 | AGENTS.md | Created/updated with real architecture after implementation |

---

## 7. Phasing Strategy

The full vision is large. We split into four phases. **Phase 1 is the only one detailed in the implementation plan.** Phase 2–4 are roadmap.

### Phase 1: Editorial Homepage + Public Content + Admin CMS + Floating AI

- DB schema (User, Article, Project, TeamMember, Feedback, Category, Tag, plus Better Auth tables)
- Better Auth migration
- Seed data (3 articles, 3 projects, 3 team members, sample feedback)
- Editorial Homepage with all 11 sections
- Floating AI Button + Dialog (UI only — no LLM backend)
- Public pages: `/`, `/research`, `/research/[slug]`, `/projects`, `/projects/[slug]`, `/about`
- Admin CMS: `/admin/articles` (Tiptap editor), `/admin/projects`, `/admin/team`, `/admin/feedback`
- Image upload to local `/public/uploads` (no ImageKit)
- Update AGENTS.md with real architecture
- Quality gates pass

### Phase 2: Public Read Polish + AI Integration

- Article SSG / ISR for published articles
- Vector search via pgvector (embed articles on publish)
- Floating AI dialog → real LLM backend (call existing AI provider)
- Search page `/search` with semantic results
- Email notifications for new feedback (admin email)

### Phase 3: Visual Storytelling Enhancements

- React Flow enhanced with real agent execution replay
- Cinematic research article hero animations
- Project detail page with architecture diagrams
- Image optimization pipeline (swap to ImageKit when ready)

### Phase 4: Community Layer

- Comments on research articles
- Subscribe to research feed (RSS, email)
- Public contributor profiles (linked to TeamMember)
- Contribution analytics

---

## 8. Phase 1 Scope (Detailed)

### 8.1 Routes created/modified

| Route | Action |
|-------|--------|
| `/` | **Modify** — full 11-section editorial homepage |
| `/research` | **Create** — index with category filter |
| `/research/[slug]` | **Create** — article detail |
| `/projects` | **Create** — showcase index |
| `/projects/[slug]` | **Create** — case-study detail |
| `/about` | **Create** — team + manifesto |
| `/admin` | **Create** — dashboard |
| `/admin/articles` | **Create** — list with tabs (All / Drafts / Published) |
| `/admin/articles/new` | **Create** — Tiptap editor (new) |
| `/admin/articles/[id]` | **Create** — Tiptap editor (edit) |
| `/admin/projects` | **Create** — list + form |
| `/admin/team` | **Create** — list + form |
| `/admin/feedback` | **Create** — list + status toggle |
| `/api/feedback` | **Create** — POST handler for public feedback submission |

### 8.2 Files created

```
src/
├── components/
│   ├── Header.tsx                       (rewrite — sticky, mobile drawer)
│   ├── Footer.tsx                       (rewrite — editorial)
│   ├── ThemeToggle.tsx                  (keep — only update label if needed)
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── TerminalShowcase.tsx
│   │   ├── ResearchTopics.tsx
│   │   ├── CapabilitiesGrid.tsx
│   │   ├── CapabilityCard.tsx
│   │   ├── ArchitectureGraph.tsx
│   │   ├── SelectedProjects.tsx
│   │   ├── LatestResearch.tsx
│   │   ├── TeamPreview.tsx
│   │   ├── FeedbackSection.tsx
│   │   └── FinalCTA.tsx
│   ├── research/
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleHeader.tsx
│   │   ├── ArticleBody.tsx
│   │   └── CategoryFilter.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   └── ProjectHeader.tsx
│   ├── team/
│   │   └── TeamMemberCard.tsx
│   ├── ai/
│   │   ├── FloatingAIButton.tsx
│   │   ├── AIAssistantDialog.tsx
│   │   ├── AIAssistantHeader.tsx
│   │   ├── AIQuickActions.tsx
│   │   ├── AIMessageList.tsx
│   │   ├── AIMessage.tsx
│   │   ├── AIExecutionState.tsx
│   │   └── AIChatInput.tsx
│   └── admin/
│       ├── AdminShell.tsx
│       ├── AdminNav.tsx
│       ├── ArticleEditor.tsx
│       ├── ArticleEditorToolbar.tsx
│       ├── ProjectManager.tsx
│       ├── TeamManager.tsx
│       └── FeedbackInbox.tsx
├── hooks/
│   ├── useArticles.ts
│   ├── useArticle.ts
│   ├── useProjects.ts
│   ├── useProject.ts
│   ├── useTeamMembers.ts
│   ├── useFeedback.ts
│   ├── useSubmitFeedback.ts
│   ├── useAIChat.ts
│   └── useAdminArticles.ts
├── lib/
│   ├── domain/
│   │   ├── routes.ts
│   │   ├── article-status.ts
│   │   ├── user-role.ts
│   │   ├── feedback.ts
│   │   ├── categories.ts
│   │   └── query-keys.ts
│   ├── schemas/
│   │   ├── article.ts
│   │   ├── project.ts
│   │   ├── team-member.ts
│   │   └── feedback.ts
│   ├── services/
│   │   ├── article-service.ts
│   │   ├── project-service.ts
│   │   ├── team-service.ts
│   │   └── feedback-service.ts
│   ├── auth.ts                          (extend — add role field to session)
│   └── slug.ts
├── server/
│   ├── articles.ts                       (server functions)
│   ├── projects.ts
│   ├── team.ts
│   └── feedback.ts
├── routes/
│   ├── __root.tsx                        (modify — add Floating AI Button + Dialog at root)
│   ├── index.tsx                         (rewrite — compose 11 sections)
│   ├── research.tsx                     (create)
│   ├── research/
│   │   └── $slug.tsx                     (create)
│   ├── projects.tsx                      (create)
│   ├── projects/
│   │   └── $slug.tsx                     (create)
│   ├── about.tsx                         (rewrite)
│   ├── admin.tsx                         (create)
│   ├── admin/
│   │   ├── index.tsx
│   │   ├── articles.tsx
│   │   ├── articles.new.tsx
│   │   ├── articles.$id.tsx
│   │   ├── projects.tsx
│   │   ├── team.tsx
│   │   └── feedback.tsx
│   └── api/
│       ├── auth/$.ts                     (existing)
│       └── feedback.ts                   (create)
├── styles.css                            (extend — JetBrains Mono + new utility classes)
└── routes/api/auth/                      (existing)
prisma/
├── schema.prisma                         (rewrite — full data model)
├── seed.ts                               (rewrite — comprehensive seed)
└── migrations/                           (auto-generated)
```

### 8.3 Dependencies to install

```bash
pnpm add motion @xyflow/react \
  @tiptap/react @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-link @tiptap/extension-image \
  @tiptap/extension-code-block-lowlight lowlight
```

shadcn components:
```bash
pnpm dlx shadcn@latest add dialog sheet dropdown-menu navigation-menu separator tabs skeleton badge card avatar scroll-area tooltip sonner progress popover accordion
```

---

## 9. Acceptance Criteria for Phase 1

A reviewer can verify completion by checking:

- [ ] `pnpm db:up` succeeds; `pnpm db:migrate` creates schema; `pnpm db:seed` populates sample data.
- [ ] `pnpm build` succeeds with zero errors.
- [ ] `pnpm test` (or vitest) passes existing tests; new tests added for critical services.
- [ ] `pnpm dlx tsc --noEmit` is clean.
- [ ] Public homepage `/` renders all 11 sections with seed data.
- [ ] `/research` lists published articles; filter by category works.
- [ ] `/research/[slug]` renders Tiptap-saved article content with editorial typography.
- [ ] `/projects` lists featured projects; `/projects/[slug]` renders case study.
- [ ] `/about` renders team members.
- [ ] Floating AI Button appears bottom-right; clicking opens dialog with header, quick actions, message area, input.
- [ ] Dialog closes via X button, Escape key, and backdrop click.
- [ ] Dialog is keyboard-accessible (focus trap, focus return).
- [ ] Feedback form on homepage submits to DB; success state shows.
- [ ] `/admin` requires Better Auth sign-in; redirects to `/api/auth/sign-in` if not authenticated.
- [ ] `/admin/articles/new` creates article via Tiptap; saved as DRAFT.
- [ ] `/admin/articles/[id]` loads existing article; Tiptap content editable; saving toggles status.
- [ ] `/admin/feedback` lists all feedback; status toggle updates DB.
- [ ] Mobile: Hamburger menu opens drawer; TerminalShowcase stacks; ArchitectureGraph degrades to vertical; AI dialog becomes bottom sheet.
- [ ] Dark/light mode works on all sections; respect system preference and user toggle.
- [ ] `prefers-reduced-motion` disables non-essential animation.
- [ ] No comments in code (`grep -rE '(^\s*//|/\*|\{/\*)' src/**/*.{ts,tsx}` returns 0 hits outside shadcn-generated files).
- [ ] All new files use `#/` import alias, never deep relative paths.
- [ ] AGENTS.md is updated to reflect actual implementation (real architecture, real commands, real do/don't).
- [ ] No magic strings: status/role/type values come from `src/lib/domain/*` constants.
- [ ] TanStack Query used for ALL server-state fetching; no `useEffect+fetch` patterns.
- [ ] Zod schemas at every form/API input boundary.
- [ ] Production build (`pnpm build`) succeeds.

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Better Auth migration breaks if env not set | Document `.env.local` setup in README; provide `.env.example` |
| React Flow adds ~50kb JS | Lazy-load via `React.lazy` on homepage section; mobile fallback to static SVG |
| Tiptap heavy editor | Code-split `/admin/articles/*` route; only loaded in admin |
| Prisma 7 + pgvector unsupported type | Document `Unsupported("vector(1536)")?` pattern; raw queries for vector ops (Phase 2) |
| New shadcn components conflict with custom styling | Add to `src/components/ui/` per AGENTS.md; customize via `cva`, never override base |
| TanStack Form + Tiptap state sync | Use Tiptap headless mode + controlled state; do not bind form state directly |
| Hero animation jank on low-end devices | Honor `prefers-reduced-motion`; use `Motion`'s `LazyMotion` to defer features |
| AI dialog fakes "online" without backend | Clearly label as "Demo mode" in dialog header; expose real backend later without UI change |

---

## 11. Out of Scope (Explicitly NOT in Phase 1)

- Real LLM backend for AI assistant (Phase 2)
- ImageKit / external image CDN (Phase 3)
- Vector embeddings + semantic search (Phase 2)
- Comments on articles (Phase 4)
- Email subscriptions / RSS (Phase 4)
- Public contributor profile pages (Phase 4)
- Multi-language (i18n)
- Analytics integration
- E2E tests (only unit + integration tests in Phase 1)

---

## 12. Open Questions

None blocking. Phase 1 plan is fully actionable. Owner will be asked to confirm:

1. Phase 1 scope = full plan as written? (foundation + editorial homepage + public pages + admin CMS + floating AI dialog)
2. Approve Phase 2–4 roadmap? (vector search + LLM + community features)
3. Approve tech additions: Motion + @xyflow/react + Tiptap + lowlight?

All three already confirmed by owner in pre-design Q&A.

---

## 13. References

- AGENTS.md (root) — engineering rules of the repository
- `docs/superpowers/plans/2026-09-10-xninetzy-labs-platform-plan.md` — task-by-task implementation plan
- TanStack Start docs
- shadcn/ui docs
- Better Auth docs
- Prisma 7 docs
- Motion docs (`motion.dev`)
- React Flow docs (`@xyflow/react`)
- Tiptap docs
