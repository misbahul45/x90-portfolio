# XNINETZY LABS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing TanStack Start starter into the XNINETZY LABS editorial platform — public editorial homepage with 11 sections, research & project content pages, admin CMS with Tiptap editor, and a global floating AI dialog.

**Architecture:**
- Build on top of existing TanStack Start + Better Auth + Prisma + shadcn foundation (no replacement).
- Editorial homepage with database-driven content; sections composed from focused, reusable components.
- Server state via TanStack Query; Zod validation at every form/API boundary; centralized domain constants.
- Floating AI assistant is a global overlay mounted at root layout — never a `/chat` route.
- Admin CMS protected by Better Auth session; Tiptap for rich-text article editing.
- Visual language: dark technical editorial, Navy (`#062B4F`) + Orange (`#D85B18`) brand.

**Tech Stack:**
- Existing: TanStack Start, React 19, TypeScript strict, Vite 7, Tailwind 4, shadcn (new-york), Prisma 7 + PostgreSQL 16 + pgvector (Docker), Better Auth, T3Env, Zod 4, TanStack Query/Form/Table, lucide-react
- New: `motion`, `@xyflow/react`, `@tiptap/react` + StarterKit + Link + Image + CodeBlockLowlight, `lowlight`, additional shadcn components

---

## Global Constraints

These are non-negotiable repository rules (from `AGENTS.md`) and design rules (from `docs/superpowers/specs/2026-09-10-xninetzy-labs-platform-design.md`).

- **No comments in code.** No `//`, `/* */`, `{/* */}` outside shadcn-generated files or license headers. Type/identifier self-documenting.
- **shadcn only for UI.** All new UI primitives via `pnpm dlx shadcn@latest add <name>`. Use `cn()` + `cva` + Tailwind for variants.
- **Path alias `#/*`** for all imports from `src/`. No deep relative paths.
- **TypeScript strict.** No `any`. `verbatimModuleSyntax: true` → `import type` for type-only.
- **TanStack Query for server state.** No `useEffect+fetch` for server data.
- **Zod at every input boundary** (forms, API inputs, query params).
- **No magic strings.** Route names, statuses, roles, categories, query keys centralized in `src/lib/domain/`.
- **TanStack Start file-based routing.** New routes as files in `src/routes/`. `pnpm dev` regenerates `routeTree.gen.ts`.
- **Database access through service layer.** UI never imports `prisma`.
- **Better Auth reuse.** No second auth implementation.
- **Server/client boundaries intentional.** Data fetching server-side; interactivity client-side.
- **Accessibility:** semantic HTML, focus management on dialogs, `prefers-reduced-motion`, ARIA only where needed.
- **Quality gates:** `pnpm build`, `pnpm test`, `tsc --noEmit` must pass before any "done" claim.
- **No `.env*` files committed.** `.env.example` is the template.
- **pgvector ready:** `Unsupported("vector(1536)")?` in Prisma; ops via `$queryRaw` (Phase 2 usage; column declared in Phase 1 for forward compatibility).
- **Floating AI dialog, NOT `/chat` route.** AI button mounted at root layout; opens dialog overlay above current page; closes via X/Esc/backdrop; preserves conversation while mounted.

---

## Phase 1A — Foundation + Editorial Homepage + Admin + Floating AI

This is the only phase detailed task-by-task. Phase 2–4 are listed as roadmap.

### File Structure (delta from current repo)

```
src/
├── components/
│   ├── Header.tsx                       (rewrite)
│   ├── Footer.tsx                       (rewrite)
│   ├── home/
│   │   ├── HeroSection.tsx              (new)
│   │   ├── TerminalShowcase.tsx         (new)
│   │   ├── ResearchTopics.tsx           (new)
│   │   ├── CapabilitiesGrid.tsx         (new)
│   │   ├── CapabilityCard.tsx           (new)
│   │   ├── ArchitectureGraph.tsx        (new)
│   │   ├── SelectedProjects.tsx         (new)
│   │   ├── LatestResearch.tsx           (new)
│   │   ├── TeamPreview.tsx              (new)
│   │   ├── FeedbackSection.tsx          (new)
│   │   └── FinalCTA.tsx                 (new)
│   ├── research/
│   │   ├── ArticleCard.tsx              (new)
│   │   ├── ArticleBody.tsx              (new — Tiptap renderer)
│   │   └── CategoryFilter.tsx           (new)
│   ├── projects/
│   │   └── ProjectCard.tsx              (new)
│   ├── team/
│   │   └── TeamMemberCard.tsx           (new)
│   ├── ai/
│   │   ├── FloatingAIButton.tsx         (new)
│   │   ├── AIAssistantDialog.tsx        (new)
│   │   ├── AIAssistantHeader.tsx        (new)
│   │   ├── AIQuickActions.tsx           (new)
│   │   ├── AIMessageList.tsx            (new)
│   │   ├── AIMessage.tsx                (new)
│   │   ├── AIExecutionState.tsx         (new)
│   │   └── AIChatInput.tsx              (new)
│   └── admin/
│       ├── AdminShell.tsx               (new)
│       ├── AdminNav.tsx                 (new)
│       ├── ArticleEditor.tsx            (new — Tiptap)
│       ├── ArticleEditorToolbar.tsx     (new)
│       ├── ProjectManager.tsx           (new)
│       ├── TeamManager.tsx              (new)
│       └── FeedbackInbox.tsx            (new)
├── hooks/
│   ├── useArticles.ts                   (new)
│   ├── useArticle.ts                    (new)
│   ├── useProjects.ts                   (new)
│   ├── useProject.ts                    (new)
│   ├── useTeamMembers.ts                (new)
│   ├── useSubmitFeedback.ts             (new)
│   ├── useAdminArticles.ts              (new)
│   ├── useAdminArticle.ts               (new)
│   ├── useAdminProjects.ts              (new)
│   ├── useAdminTeam.ts                  (new)
│   └── useAdminFeedback.ts              (new)
├── lib/
│   ├── domain/
│   │   ├── routes.ts                    (new)
│   │   ├── article-status.ts            (new)
│   │   ├── user-role.ts                 (new)
│   │   ├── feedback.ts                  (new)
│   │   ├── categories.ts                (new)
│   │   └── query-keys.ts                (new)
│   ├── schemas/
│   │   ├── article.ts                   (new)
│   │   ├── project.ts                   (new)
│   │   ├── team-member.ts               (new)
│   │   └── feedback.ts                  (new)
│   ├── services/
│   │   ├── article-service.ts           (new)
│   │   ├── project-service.ts           (new)
│   │   ├── team-service.ts              (new)
│   │   └── feedback-service.ts          (new)
│   ├── auth.ts                          (modify — add Prisma adapter)
│   ├── auth-client.ts                   (keep)
│   ├── slug.ts                          (new)
│   └── utils.ts                         (keep)
├── server/
│   ├── articles.ts                      (new — createServerFn)
│   ├── projects.ts                      (new)
│   ├── team.ts                          (new)
│   └── feedback.ts                      (new)
├── routes/
│   ├── __root.tsx                       (modify — add Floating AI)
│   ├── index.tsx                        (rewrite — 11-section homepage)
│   ├── research.tsx                     (new — list)
│   ├── research/
│   │   └── $slug.tsx                    (new — detail)
│   ├── projects.tsx                     (new — list)
│   ├── projects/
│   │   └── $slug.tsx                    (new — detail)
│   ├── about.tsx                        (rewrite)
│   ├── admin.tsx                        (new)
│   ├── admin/
│   │   ├── index.tsx                    (new — dashboard)
│   │   ├── articles.tsx                 (new — list)
│   │   ├── articles.new.tsx             (new — editor)
│   │   ├── articles.$id.tsx             (new — editor)
│   │   ├── projects.tsx                 (new)
│   │   ├── team.tsx                     (new)
│   │   └── feedback.tsx                 (new)
│   └── api/
│       ├── auth/$.ts                    (keep)
│       └── feedback.ts                  (new)
├── styles.css                           (modify — add JetBrains Mono + new utilities)
└── env.ts                               (modify — add ADMIN_EMAILS optional)
prisma/
├── schema.prisma                        (rewrite — full data model)
├── seed.ts                              (rewrite — comprehensive seed)
└── migrations/                          (auto-generated)
```

---

## Task 1: Update Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `prisma.user`, `prisma.article`, `prisma.project`, `prisma.teamMember`, `prisma.feedback`, `prisma.category`, `prisma.tag`, `prisma.session`, `prisma.account`, `prisma.verification`

- [ ] **Step 1**: Write the new schema (see design doc §3.2 for full definition)
- [ ] **Step 2**: Validate syntax: `pnpm db:up && sleep 3 && pnpm dlx prisma validate`
- [ ] **Step 3**: Format: `pnpm dlx prisma format`
- [ ] **Step 4**: Commit: `git add prisma/schema.prisma && git commit -m "feat(db): add Article/Project/TeamMember/Feedback schema with pgvector placeholder"`

---

## Task 2: Update Better Auth to use Prisma adapter

**Files:**
- Modify: `src/lib/auth.ts`

**Interfaces:**
- Produces: `auth` instance with Prisma persistence (instead of in-memory default)

- [ ] **Step 1**: Import `prismaAdapter` from `better-auth/adapters/prisma`
- [ ] **Step 2**: Add `database: prismaAdapter(prisma, { provider: "postgresql" })` to `betterAuth` config
- [ ] **Step 3**: Add `user: { additionalFields: { role: { type: "string", required: false, defaultValue: "READER" } } }` to config
- [ ] **Step 4**: Verify typecheck: `node_modules/.bin/tsc --noEmit` (expect no new errors from auth.ts)
- [ ] **Step 5**: Commit: `git add src/lib/auth.ts && git commit -m "feat(auth): wire Prisma adapter with role field"`

---

## Task 3: Run Better Auth + Prisma migrations

**Files:**
- Generate: `prisma/migrations/*` (auto)

**Interfaces:**
- Produces: All tables in PostgreSQL DB

- [ ] **Step 1**: `cp .env.example .env.local` and fill `BETTER_AUTH_SECRET` via `pnpm dlx @better-auth/cli secret`
- [ ] **Step 2**: `pnpm db:up` (ensure container running)
- [ ] **Step 3**: `pnpm dlx prisma migrate dev --name init` (creates schema)
- [ ] **Step 4**: `pnpm dlx @better-auth/cli generate` (writes Better Auth additions to schema if needed)
- [ ] **Step 5**: `pnpm dlx prisma generate` (regenerate client)
- [ ] **Step 6**: Verify: `pnpm db:psql -c "\dt"` shows tables
- [ ] **Step 7**: Commit: `git add prisma/migrations && git commit -m "feat(db): initial migration"`

---

## Task 4: Rewrite seed script

**Files:**
- Modify: `prisma/seed.ts`

**Interfaces:**
- Produces: Seed data (3 categories, 4 tags, 3 articles, 3 projects, 3 team members, 2 feedback, 1 admin user)

- [ ] **Step 1**: Delete existing `Todo` references; seed new entities
- [ ] **Step 2**: Use realistic placeholder content (see design doc §29 / spec examples)
- [ ] **Step 3**: Create one admin user: `email: admin@xninetzy.local`, hashed password (generate via Better Auth API)
- [ ] **Step 4**: Set article `status: PUBLISHED`, `publishedAt: now()`, and compute `readingTime` from content word count
- [ ] **Step 5**: Article `content` is JSON-stringified Tiptap doc
- [ ] **Step 6**: Run: `pnpm db:seed`
- [ ] **Step 7**: Verify: `pnpm db:psql -c "SELECT count(*) FROM \"Article\";"` returns 3
- [ ] **Step 8**: Commit: `git add prisma/seed.ts && git commit -m "feat(db): seed xninetzy content (3 articles, 3 projects, 3 team, 2 feedback, 1 admin)"`

---

## Task 5: Install new dependencies

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1**: `pnpm add motion @xyflow/react @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-code-block-lowlight lowlight`
- [ ] **Step 2**: `pnpm dlx shadcn@latest add dialog sheet dropdown-menu navigation-menu separator tabs skeleton badge card avatar scroll-area tooltip sonner progress popover accordion`
- [ ] **Step 3**: Verify: `node_modules/.bin/tsc --noEmit` (expect only pre-existing Prisma-generated-client errors)
- [ ] **Step 4**: Commit: `git add package.json pnpm-lock.yaml src/components/ui && git commit -m "feat(deps): add motion, xyflow, tiptap, lowlight; install shadcn dialogs/sheets/etc"`

---

## Task 6: Domain constants module

**Files:**
- Create: `src/lib/domain/routes.ts`
- Create: `src/lib/domain/article-status.ts`
- Create: `src/lib/domain/user-role.ts`
- Create: `src/lib/domain/feedback.ts`
- Create: `src/lib/domain/categories.ts`
- Create: `src/lib/domain/query-keys.ts`

**Interfaces:**
- Produces: typed constants used across UI, server functions, services

- [ ] **Step 1**: Define `ROUTES` with home/research/projects/about/admin paths and detail functions (see design doc §3.5)
- [ ] **Step 2**: Define `ARTICLE_STATUS`, `USER_ROLE`, `FEEDBACK_TYPE`, `FEEDBACK_STATUS` as `as const`
- [ ] **Step 3**: Define `CATEGORIES` array with `{ slug, name }` (LLM, RAG, AGENTS, ML, DL, DATA)
- [ ] **Step 4**: Define `queryKeys` factory: `articleKeys.lists()`, `articleKeys.detail(slug)`, etc.
- [ ] **Step 5**: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 6**: Commit: `git add src/lib/domain && git commit -m "feat(domain): centralized constants for routes, statuses, roles, categories, query keys"`

---

## Task 7: Zod schemas

**Files:**
- Create: `src/lib/schemas/article.ts`
- Create: `src/lib/schemas/project.ts`
- Create: `src/lib/schemas/team-member.ts`
- Create: `src/lib/schemas/feedback.ts`

**Interfaces:**
- Produces: `articleCreateSchema`, `articleUpdateSchema`, `projectCreateSchema`, `teamMemberSchema`, `feedbackSchema`

- [ ] **Step 1**: `feedbackSchema` (public submission): `name` (1–80), `email` (email), `message` (10–2000), `type` (enum)
- [ ] **Step 2**: `articleCreateSchema`: title, slug (regex), excerpt, content (JSON string), coverImage (URL?), categoryId (cuid?), tags (string[]), status (default DRAFT)
- [ ] **Step 3**: `articleUpdateSchema`: same as create but all fields optional + `id` required
- [ ] **Step 4**: `projectCreateSchema` / `projectUpdateSchema`: title, slug, description, content, coverImage?, technologies (string[]), githubUrl?, demoUrl?, featured, order, categoryId?
- [ ] **Step 5**: `teamMemberSchema`: name, role, bio?, avatar?, github?, linkedin?, website?, featured, order
- [ ] **Step 6**: Export inferred types: `type FeedbackInput = z.infer<typeof feedbackSchema>`, etc.
- [ ] **Step 7**: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 8**: Commit: `git add src/lib/schemas && git commit -m "feat(schemas): Zod schemas for all entity CRUD and feedback"`

---

## Task 8: Service layer (DB access)

**Files:**
- Create: `src/lib/services/article-service.ts`
- Create: `src/lib/services/project-service.ts`
- Create: `src/lib/services/team-service.ts`
- Create: `src/lib/services/feedback-service.ts`

**Interfaces:**
- Produces: pure async functions used by server functions

- [ ] **Step 1**: `articleService.list({ status, categorySlug })` returns Article[] with author + category
- [ ] **Step 2**: `articleService.bySlug(slug)` returns Article or null
- [ ] **Step 3**: `articleService.create(input)` validates via Zod, generates slug if missing, persists, returns
- [ ] **Step 4**: `articleService.update(id, input)` validates, persists, returns
- [ ] **Step 5**: `articleService.delete(id)` (admin only)
- [ ] **Step 6**: Similar CRUD for `projectService`, `teamService`
- [ ] **Step 7**: `feedbackService.submit(input)` (public, no auth), `feedbackService.list()` (admin), `feedbackService.updateStatus(id, status)` (admin)
- [ ] **Step 8**: All return typed objects (no Prisma model leakage; map to DTOs where useful)
- [ ] **Step 9**: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 10**: Commit: `git add src/lib/services && git commit -m "feat(services): DB access layer for articles/projects/team/feedback"`

---

## Task 9: Server functions

**Files:**
- Create: `src/server/articles.ts`
- Create: `src/server/projects.ts`
- Create: `src/server/team.ts`
- Create: `src/server/feedback.ts`

**Interfaces:**
- Produces: `createServerFn().handler(...)` instances callable from client via type-safe RPC

- [ ] **Step 1**: For each service method, wrap in `createServerFn({ method: "GET" | "POST" }).handler(async ({ data }) => service.method(data))`
- [ ] **Step 2**: Public endpoints: `articles.listPublic`, `articles.bySlugPublic`, `projects.listPublic`, `projects.bySlugPublic`, `team.listPublic`, `feedback.submitPublic`
- [ ] **Step 3**: Admin endpoints: `articles.admin*`, `projects.admin*`, `team.admin*`, `feedback.admin*` — guard with Better Auth session check (`const session = await auth.api.getSession({ headers })`)
- [ ] **Step 4**: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 5**: Commit: `git add src/server && git commit -m "feat(server): server functions wrapping services with public/admin split"`

---

## Task 10: Custom hooks (TanStack Query)

**Files:**
- Create: `src/hooks/useArticles.ts`
- Create: `src/hooks/useArticle.ts`
- Create: `src/hooks/useProjects.ts`
- Create: `src/hooks/useProject.ts`
- Create: `src/hooks/useTeamMembers.ts`
- Create: `src/hooks/useSubmitFeedback.ts`
- Create: `src/hooks/useAdminArticles.ts`
- Create: `src/hooks/useAdminArticle.ts`
- Create: `src/hooks/useAdminProjects.ts`
- Create: `src/hooks/useAdminTeam.ts`
- Create: `src/hooks/useAdminFeedback.ts`

**Interfaces:**
- Produces: typed Query/Mutation hooks using `queryKeys` factory

- [ ] **Step 1**: `useArticles({ categorySlug })` → `useQuery({ queryKey: articleKeys.list({ categorySlug }), queryFn: () => server.articles.listPublic({ categorySlug }) })`
- [ ] **Step 2**: `useArticle(slug)` → detail
- [ ] **Step 3**: `useProjects({ featuredOnly? })` → list
- [ ] **Step 4**: `useProject(slug)` → detail
- [ ] **Step 5**: `useTeamMembers()` → list
- [ ] **Step 6**: `useSubmitFeedback()` → `useMutation` calling `server.feedback.submitPublic`, invalidates `feedbackKeys.adminList()`
- [ ] **Step 7**: Admin hooks similar pattern
- [ ] **Step 8**: Each hook returns `{ data, isPending, isError }` — no silent error swallowing
- [ ] **Step 9**: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 10**: Commit: `git add src/hooks && git commit -m "feat(hooks): TanStack Query hooks for public read + admin CRUD + feedback submit"`

---

## Task 11: Slug utility

**Files:**
- Create: `src/lib/slug.ts`

**Interfaces:**
- Produces: `slugify(input: string): string`

- [ ] **Step 1**: Lowercase, replace whitespace with `-`, strip non-alphanumeric (keep `-`)
- [ ] **Step 2**: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 3**: Commit: `git add src/lib/slug.ts && git commit -m "feat(lib): slugify utility"`

---

## Task 12: Rewrite Header

**Files:**
- Modify: `src/components/Header.tsx`

**Interfaces:**
- Produces: sticky transparent → bordered header with mobile drawer

- [ ] **Step 1**: Use shadcn `NavigationMenu` + `Sheet` (drawer) + `DropdownMenu` (theme)
- [ ] **Step 2**: Brand logo: "XNINETZY LABS" with orange dot
- [ ] **Step 3**: Nav links: `ROUTES.RESEARCH`, `ROUTES.PROJECTS`, `ROUTES.ABOUT`
- [ ] **Step 4**: Right side: ThemeToggle + (when authed) avatar dropdown
- [ ] **Step 5**: Mobile: hamburger → Sheet drawer
- [ ] **Step 6**: Use Motion to fade in on scroll
- [ ] **Step 7**: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 8**: Commit: `git add src/components/Header.tsx && git commit -m "feat(header): sticky editorial header with mobile drawer"`

---

## Task 13: Rewrite Footer

**Files:**
- Modify: `src/components/Footer.tsx`

**Interfaces:**
- Produces: editorial footer with brand + nav + social

- [ ] **Step 1**: Three columns: Brand+tagline / Sitemap / Social
- [ ] **Step 2]: Use `lucide-react` icons for social (X, GitHub)
- [ ] **Step 3**: Copy year + tagline
- [ ] **Step 4**: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 5**: Commit: `git add src/components/Footer.tsx && git commit -m "feat(footer): editorial footer"`

---

## Task 14: Motion variants library

**Files:**
- Create: `src/lib/motion-variants.ts`

**Interfaces:**
- Produces: shared Motion variants used across sections

- [ ] **Step 1**: `fadeInUp`, `fadeIn`, `stagger`, `typewriterCursor`, `revealOnScroll`
- [ ] **Step 2**: Respect `prefers-reduced-motion` via `useReducedMotion()`
- [ ] **Step 3**: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 4**: Commit: `git add src/lib/motion-variants.ts && git commit -m "feat(motion): shared variants library"`

---

## Task 15: HeroSection + TerminalShowcase

**Files:**
- Create: `src/components/home/HeroSection.tsx`
- Create: `src/components/home/TerminalShowcase.tsx`

**Interfaces:**
- Consumes: `queryKeys` for featured project count, etc.
- Produces: hero with type-writer effect + terminal simulation

- [ ] **Step 1**: `HeroSection` accepts nothing; renders brand+tagline+CTAs
- [ ] **Step 2**: Tagline "Research. Experiment. Build." type-writer with Motion `animate` on first viewport entry
- [ ] **Step 3**: CTAs: "Explore Research" → `ROUTES.RESEARCH`, "Work With Us" → `#feedback`
- [ ] **Step 4**: `TerminalShowcase` renders simulated terminal: `$ xninetzy agent init` → checks → architecture diagram (mini React Flow or SVG)
- [ ] **Step 5**: Use `useReducedMotion` to disable streaming on reduced-motion
- [ ] **Step 6]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 7**: Commit: `git add src/components/home/HeroSection.tsx src/components/home/TerminalShowcase.tsx && git commit -m "feat(home): hero with type-writer tagline and terminal showcase"`

---

## Task 16: ResearchTopics

**Files:**
- Create: `src/components/home/ResearchTopics.tsx`

**Interfaces:**
- Produces: topic ticker (LLM / RAG / AGENTS / ML / DL / DATA) with subtle activity indicator

- [ ] **Step 1**: Horizontal ticker; topics from `CATEGORIES`
- [ ] **Step 2]: Small "activity" subline per topic: "12 experiments" (static placeholder for Phase 1)
- [ ] **Step 3]: Use Motion stagger reveal
- [ ] **Step 4]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 5]: Commit: `git add src/components/home/ResearchTopics.tsx && git commit -m "feat(home): research topic ticker"`

---

## Task 17: CapabilitiesGrid + CapabilityCard

**Files:**
- Create: `src/components/home/CapabilitiesGrid.tsx`
- Create: `src/components/home/CapabilityCard.tsx`

**Interfaces:**
- Produces: 5 capability cards with mini architecture diagrams on hover

- [ ] **Step 1**: `CapabilityCard` props: `{ title, description, diagram: ReactNode }`
- [ ] **Step 2]: On hover (Motion), diagram fades in; nodes pulse
- [ ] **Step 3]: Hardcoded 5 capabilities data (from spec §8) in CapabilitiesGrid
- [ ] **Step 4]: Use shadcn `Card` primitive
- [ ] **Step 5**: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 6]: Commit: `git add src/components/home/CapabilitiesGrid.tsx src/components/home/CapabilityCard.tsx && git commit -m "feat(home): capabilities grid with hover architecture diagrams"`

---

## Task 18: ArchitectureGraph (React Flow)

**Files:**
- Create: `src/components/home/ArchitectureGraph.tsx`

**Interfaces:**
- Produces: React Flow graph (INPUT → PLANNER → RAG/TOOLS/MEMORY → REASONER → OUTPUT) with execution state

- [ ] **Step 1]: Lazy-import `@xyflow/react` via `React.lazy` for code-split
- [ ] **Step 2]: Define nodes: `Input`, `Planner`, `Retriever`, `Tools`, `Memory`, `Reasoner`, `Output`
- [ ] **Step 3]: Animated edges (CSS keyframes)
- [ ] **Step 4]: Side panel with execution state (idle/running/completed per node)
- [ ] **Step 5]: Code panel showing pseudo TypeScript snippet
- [ ] **Step 6]: Mobile: degrade to vertical stack
- [ ] **Step 7]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 8]: Commit: `git add src/components/home/ArchitectureGraph.tsx && git commit -m "feat(home): ArchitectureGraph with React Flow"`

---

## Task 19: SelectedProjects + LatestResearch + TeamPreview

**Files:**
- Create: `src/components/home/SelectedProjects.tsx`
- Create: `src/components/home/LatestResearch.tsx`
- Create: `src/components/home/TeamPreview.tsx`

**Interfaces:**
- Consumes: `useProjects({ featuredOnly: true })`, `useArticles({ publishedOnly: true })`, `useTeamMembers({ featuredOnly: true })`

- [ ] **Step 1]: `SelectedProjects` renders 3 featured projects using `ProjectCard`
- [ ] **Step 2]: `LatestResearch` renders 3 latest articles using `ArticleCard`
- [ ] **Step 3]: `TeamPreview` renders featured team members using `TeamMemberCard`
- [ ] **Step 4]: Loading state: skeleton per item
- [ ] **Step 5]: Error state: muted message
- [ ] **Step 6]: Empty state: "No data yet" message (only if applicable)
- [ ] **Step 7]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 8]: Commit: `git add src/components/home/SelectedProjects.tsx src/components/home/LatestResearch.tsx src/components/home/TeamPreview.tsx && git commit -m "feat(home): selected projects, latest research, team preview sections"`

---

## Task 20: FeedbackSection (public form)

**Files:**
- Create: `src/components/home/FeedbackSection.tsx`

**Interfaces:**
- Consumes: `useSubmitFeedback()`
- Produces: form with name/email/message/type fields, success/error states

- [ ] **Step 1]: Use `useAppForm` from existing form hook pattern (`src/hooks/demo.form.ts`); promote to `src/hooks/useAppForm.ts`
- [ ] **Step 2]: Zod validation via `feedbackSchema`
- [ ] **Step 3]: Submit via `useSubmitFeedback()` mutation
- [ ] **Step 4]: Loading/success/error states
- [ ] **Step 5]: Show "Recent feedback" below form using a server function (`feedback.recentPublic`) returning last 3
- [ ] **Step 6]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 7]: Commit: `git add src/components/home/FeedbackSection.tsx && git commit -m "feat(home): feedback form with mutation and recent feedback list"`

---

## Task 21: FinalCTA

**Files:**
- Create: `src/components/home/FinalCTA.tsx`

**Interfaces:**
- Produces: section with "Have a problem worth engineering?" + CTAs

- [ ] **Step 1]: Display title + subtitle + 2 CTAs ("Start a Project", "Explore Research")
- [ ] **Step 2]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 3]: Commit: `git add src/components/home/FinalCTA.tsx && git commit -m "feat(home): final CTA section"`

---

## Task 22: Compose homepage

**Files:**
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Produces: 11-section homepage composition

- [ ] **Step 1]: Compose all home sections in order with proper section IDs for anchors
- [ ] **Step 2]: Set page metadata via TanStack Router `head`
- [ ] **Step 3]: Verify: `pnpm build` succeeds; manual dev verify
- [ ] **Step 4]: Commit: `git add src/routes/index.tsx && git commit -m "feat(home): compose 11-section editorial homepage"`

---

## Task 23: Public pages — research list + detail

**Files:**
- Create: `src/routes/research.tsx`
- Create: `src/routes/research/$slug.tsx`
- Create: `src/components/research/ArticleCard.tsx`
- Create: `src/components/research/ArticleBody.tsx`
- Create: `src/components/research/CategoryFilter.tsx`

**Interfaces:**
- Consumes: `useArticles`, `useArticle`
- Produces: editorial research index + article detail

- [ ] **Step 1]: `research.tsx`: header + CategoryFilter + grid of ArticleCard
- [ ] **Step 2]: `$slug.tsx`: article header (title/author/date/cover) + ArticleBody (Tiptap renderer)
- [ ] **Step 3]: `ArticleBody`: parse Tiptap JSON, render nodes (headings, paragraphs, code, blockquote, lists, images, callouts)
- [ ] **Step 4]: SEO metadata in `head`
- [ ] **Step 5]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 6]: Commit: `git add src/routes/research.tsx src/routes/research/ src/components/research && git commit -m "feat(research): list + detail pages with Tiptap renderer"`

---

## Task 24: Public pages — projects list + detail

**Files:**
- Create: `src/routes/projects.tsx`
- Create: `src/routes/projects/$slug.tsx`
- Create: `src/components/projects/ProjectCard.tsx`
- Create: `src/components/projects/ProjectHeader.tsx`

- [ ] **Step 1]: `projects.tsx`: header + grid of ProjectCard
- [ ] **Step 2]: `$slug.tsx`: ProjectHeader (cover, title, stack, github/demo links) + content
- [ ] **Step 3]: SEO metadata
- [ ] **Step 4]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 5]: Commit: `git add src/routes/projects.tsx src/routes/projects/ src/components/projects && git commit -m "feat(projects): list + detail pages"`

---

## Task 25: About page

**Files:**
- Modify: `src/routes/about.tsx`

- [ ] **Step 1]: Manifesto section + TeamMemberCard grid + optional CTA
- [ ] **Step 2]: Pull from `useTeamMembers()`
- [ ] **Step 3]: SEO metadata
- [ ] **Step 4]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 5]: Commit: `git add src/routes/about.tsx && git commit -m "feat(about): team + manifesto page"`

---

## Task 26: AdminShell + AdminNav

**Files:**
- Create: `src/components/admin/AdminShell.tsx`
- Create: `src/components/admin/AdminNav.tsx`
- Create: `src/routes/admin.tsx`

**Interfaces:**
- Produces: protected layout with sidebar nav

- [ ] **Step 1]: `admin.tsx` route: `beforeLoad` checks `auth.api.getSession({ headers })`, redirects to `/api/auth/sign-in` if no session
- [ ] **Step 2]: `AdminShell`: sidebar + content area; nav with Articles, Projects, Team, Feedback
- [ ] **Step 3]: Use shadcn `Sidebar` primitives (or build with Sheet on mobile)
- [ ] **Step 4]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 5]: Commit: `git add src/components/admin/AdminShell.tsx src/components/admin/AdminNav.tsx src/routes/admin.tsx && git commit -m "feat(admin): protected shell with sidebar nav"`

---

## Task 27: Admin dashboard

**Files:**
- Create: `src/routes/admin/index.tsx`

- [ ] **Step 1]: Show counts: articles (published/draft), projects, team, feedback (new)
- [ ] **Step 2]: Recent activity list (last 5 actions)
- [ ] **Step 3]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 4]: Commit: `git add src/routes/admin/index.tsx && git commit -m "feat(admin): dashboard with counts"`

---

## Task 28: Admin articles list + Tiptap editor

**Files:**
- Create: `src/routes/admin/articles.tsx`
- Create: `src/routes/admin/articles.new.tsx`
- Create: `src/routes/admin/articles.$id.tsx`
- Create: `src/components/admin/ArticleEditor.tsx`
- Create: `src/components/admin/ArticleEditorToolbar.tsx`

- [ ] **Step 1]: `articles.tsx`: tabs (All / Drafts / Published) + table of articles with edit/delete actions
- [ ] **Step 2]: `articles.new.tsx`: render `ArticleEditor` with empty state
- [ ] **Step 3]: `articles.$id.tsx`: load article by id, render `ArticleEditor` with content
- [ ] **Step 4]: `ArticleEditor`: Tiptap with StarterKit + Link + Image + CodeBlockLowlight; title/subtitle inputs above editor
- [ ] **Step 5]: `ArticleEditorToolbar`: sticky top with Save Draft / Publish / Delete
- [ ] **Step 6]: Cover image URL input (Phase 1 = URL only; upload later)
- [ ] **Step 7]: Autosave every 10s to draft via `useAdminArticle` mutation
- [ ] **Step 8]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 9]: Commit: `git add src/routes/admin/articles.tsx src/routes/admin/articles.new.tsx src/routes/admin/articles.\$id.tsx src/components/admin/ArticleEditor.tsx src/components/admin/ArticleEditorToolbar.tsx && git commit -m "feat(admin): articles list + Tiptap editor"`

---

## Task 29: Admin projects manager

**Files:**
- Create: `src/routes/admin/projects.tsx`
- Create: `src/components/admin/ProjectManager.tsx`

- [ ] **Step 1]: List projects with edit/delete actions
- [ ] **Step 2]: Form: title/slug/description/content/cover/technologies/github/demo/featured/order/category
- [ ] **Step 3]: Use TanStack Form + Zod
- [ ] **Step 4]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 5]: Commit: `git add src/routes/admin/projects.tsx src/components/admin/ProjectManager.tsx && git commit -m "feat(admin): projects manager"`

---

## Task 30: Admin team manager

**Files:**
- Create: `src/routes/admin/team.tsx`
- Create: `src/components/admin/TeamManager.tsx`

- [ ] **Step 1]: List team members with edit/delete
- [ ] **Step 2]: Form: name/role/bio/avatar/github/linkedin/website/featured/order
- [ ] **Step 3]: Use TanStack Form + Zod
- [ ] **Step 4]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 5]: Commit: `git add src/routes/admin/team.tsx src/components/admin/TeamManager.tsx && git commit -m "feat(admin): team manager"`

---

## Task 31: Admin feedback inbox

**Files:**
- Create: `src/routes/admin/feedback.tsx`
- Create: `src/components/admin/FeedbackInbox.tsx`

- [ ] **Step 1]: List all feedback; filter by status; status toggle action
- [ ] **Step 2]: Delete action (with confirmation)
- [ ] **Step 3]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 4]: Commit: `git add src/routes/admin/feedback.tsx src/components/admin/FeedbackInbox.tsx && git commit -m "feat(admin): feedback inbox"`

---

## Task 32: Floating AI Button + Dialog

**Files:**
- Create: `src/components/ai/FloatingAIButton.tsx`
- Create: `src/components/ai/AIAssistantDialog.tsx`
- Create: `src/components/ai/AIAssistantHeader.tsx`
- Create: `src/components/ai/AIQuickActions.tsx`
- Create: `src/components/ai/AIMessageList.tsx`
- Create: `src/components/ai/AIMessage.tsx`
- Create: `src/components/ai/AIExecutionState.tsx`
- Create: `src/components/ai/AIChatInput.tsx`
- Create: `src/hooks/useAIChat.ts`

**Interfaces:**
- Produces: floating button + dialog overlay mounted at root layout

- [ ] **Step 1]: `useAIChat`: local state for messages + simulated execution stages (`idle` → `analyzing` → `retrieving` → `reasoning` → `completed`)
- [ ] **Step 2]: `FloatingAIButton`: bottom-right, motion-revealed on scroll; small label on hover
- [ ] **Step 3]: `AIAssistantDialog`: shadcn `Dialog` (desktop) → `Sheet` (mobile); focus trap, Esc to close, focus return
- [ ] **Step 4]: `AIAssistantHeader`: brand + "● Online" (Phase 1 = UI only, clearly demo state) + close X
- [ ] **Step 5]: `AIQuickActions`: context-aware suggested prompts (use `useLocation` from `@tanstack/react-router`)
- [ ] **Step 6]: `AIMessageList`: scrollable area; `AIMessage` for user (neutral) vs assistant (editorial)
- [ ] **Step 7]: `AIExecutionState`: shows stage pipeline with subtle motion
- [ ] **Step 8]: `AIChatInput`: textarea + submit; Enter sends, Shift+Enter newline
- [ ] **Step 9]: Mobile: bottom sheet, safe-area aware, keyboard-aware layout
- [ ] **Step 10]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 11]: Commit: `git add src/components/ai src/hooks/useAIChat.ts && git commit -m "feat(ai): floating AI button + dialog with context-aware quick actions"`

---

## Task 33: Mount Floating AI at root

**Files:**
- Modify: `src/routes/__root.tsx`

**Interfaces:**
- Produces: AI button visible on every public route

- [ ] **Step 1]: Render `<FloatingAIButton />` + `<AIAssistantDialog />` inside root document, outside route content but inside TanStackQueryProvider
- [ ] **Step 2]: Verify: AI button visible on `/`, `/research`, `/projects`, `/about`
- [ ] **Step 3]: Verify: `node_modules/.bin/tsc --noEmit`
- [ ] **Step 4]: Commit: `git add src/routes/__root.tsx && git commit -m "feat(root): mount floating AI button globally"`

---

## Task 34: Update AGENTS.md with real architecture

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1]: Document all new routes, components, hooks, services, schemas, domain constants
- [ ] **Step 2]: Document tech stack additions (motion, xyflow, tiptap)
- [ ] **Step 3]: Document data model overview (Article, Project, TeamMember, Feedback)
- [ ] **Step 4]: Document admin auth pattern
- [ ] **Step 5]: Document floating AI dialog architecture
- [ ] **Step 6]: Add do/don't rules for future agents
- [ ] **Step 7]: Commit: `git add AGENTS.md && git commit -m "docs(agents): update with xninetzy labs architecture"`

---

## Task 35: Final QA + audit

- [ ] **Step 1]: `node_modules/.bin/tsc --noEmit` — must be clean
- [ ] **Step 2]: `node_modules/.bin/vite build` — must succeed
- [ ] **Step 3]: `node_modules/.bin/vitest run` — must pass (or note no tests yet)
- [ ] **Step 4]: `pnpm dev` — manual smoke test all routes
- [ ] **Step 5]: Run audit checklist from design doc §9
- [ ] **Step 6]: Fix any TODO placeholders or runtime errors
- [ ] **Step 7]: Final commit: `git commit --allow-empty -m "chore: phase 1 complete — verified end-to-end"`

---

## Phase 2 — Roadmap (detailed plan deferred)

- Wire pgvector: embed articles on publish; semantic search `/search`
- Real LLM backend for AI assistant (call existing AI provider, swap simulated execution state for real stages)
- SSG / ISR for published articles
- Email notifications for new feedback
- Search page with semantic + keyword results
- Polish animations (cinematic article hero)

## Phase 3 — Roadmap

- Swap local upload to ImageKit
- React Flow execution replay with real agent traces
- Project detail page with interactive architecture
- Image optimization pipeline

## Phase 4 — Roadmap

- Comments on research articles
- Subscribe to research feed (RSS, email)
- Public contributor profiles
- Contribution analytics
