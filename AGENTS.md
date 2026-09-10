# AGENTS.md — XNINETZY Labs

Operating rules untuk semua agent dan kontributor yang bekerja di repository ini.

## Project Snapshot

- **Nama**: `x90-labs-portfolio` (private, TanStack Start)
- **Tujuan**: Landing page software house XNINETZY Labs — jual jasa Automation (n8n), AI Assistant, Agentic System, Web End-to-End, Mobile End-to-End. AI Labs diposisikan sebagai value-add (research + portfolio) di samping delivery.
- **Brand**: XNINETZY Labs · "Software House" · positioning "saya + tim"
- **Stack**: TanStack Start + Router (file-based) + React 19 + TypeScript strict + Vite 7 + Tailwind CSS 4 + Prisma 7 + PostgreSQL 16 + pgvector + Better Auth + T3Env + TanStack Query/Form/Table + Motion + @xyflow/react + Tiptap
- **Branching**: `main` (deploy), fitur di branch terpisah, PR review wajib
- **Package manager**: bun (`bun install`, `bun run`, `bunx`)

## Canonical Visual System

- **Background**: `#071426` (`--lab-bg`)
- **Navy family**: `#0A1628` / `#0B1A30` / `#0D2038` / `#112946`
- **Card surface**: `#0B1A30` (`--lab-card`), elevated `#112946` (`--lab-card-elevated`)
- **Borders**: `rgba(255,255,255,0.10)` default, `rgba(255,255,255,0.18)` strong
- **Orange accent**: `#F65A0B` (`--lab-orange`) — single accent, 5–15% visual weight
  - Light variant `#FF6A18`, dark variant `#D94D08`, soft fill `rgba(246,90,11,0.10)`
- **Text**: `#F8FAFC` primary, `#8FA3BD` secondary, `#60758F` muted
- Hero is the **only** place orange takes visual lead. Other sections: orange as accent (icons, hover, focus, single highlight).
- All design tokens live in `src/styles.css` as CSS custom properties. Use `var(--lab-*)` in Tailwind via `[var(--lab-orange)]` syntax — never hardcode hex in components.
- Light floating Brief Builder remains the one warm/light panel inside the dark surface.
- Project detail and About pages use shadcn light theme tokens (`bg-card`, `text-foreground`, `border-border`). Do NOT migrate them to navy.

## Hard UI Rules

- **NO badges / pills / chips / floating labels / decorative capsules / category tags.** Section headings must be real typography.
- **NO per-section gradient / kicker badge / uppercase metadata strip.** Hierarchy comes from font size, weight, spacing, grid, borders.
- **NO multi-color sections.** One navy family + one orange accent per section.
- Tech stack presentation: editorial list (`<ul>` + `<li>`) or grid with hairline separators via `gap-px bg-[var(--lab-line)]` trick — NOT rounded pill walls.
- Process step metadata: large mono number (`01`, `02`, …) — NOT small badge.
- Brief Builder keeps functional chip controls only (project type, audience, priority). No `LIVE` pill, no decorative sample prompts as pills.
- CTA hierarchy: `Button` default (primary) > `Button variant="outline"` > `Button variant="ghost"` with `border-[var(--lab-line)]` + hover orange. NEVER green/emerald outline variant.

## Non-Negotiable Rules

### 1. Dilarang Menulis Komentar di Kode

- JANGAN tulis komentar inline (`// ...`) atau block (`/* ... */`) atau JSX (`{/* */}`) di file kode.
- Nama identifier, struktur, dan type harus self-documenting; refactor bila perlu.
- Pengecualian HANYA untuk:
  - JSDoc/TSDoc pada exported public API ketika type tidak cukup menjelaskan (jarang, harus ada justifikasi).
  - File yang sudah ada dari generator/CRA/CTA yang berisi komentar license header — JANGAN dihapus.
- PR yang menambah komentar kode akan ditolak.

### 2. shadcn adalah Standarisasi UI Library

- SEMUA komponen UI baru **WAJIB** berasal dari `shadcn` (`bunx shadcn@latest add <component>`), BUKAN library UI lain.
- Komponen shadcn yang sudah ter-install berada di `src/components/ui/`. JANGAN tulis ulang atau override styling fundamentalnya.
- Untuk variant/customisasi: gunakan `cva` + `cn()` utility dari `#/lib/utils` + Tailwind utilities saja.
- Icon library standar: `lucide-react`. Import ikon dari `lucide-react`, BUKAN inline SVG kecuali untuk logo brand.
- Styling tokens (warna, radius, spacing) berasal dari CSS variables di `src/styles.css` (`--background`, `--foreground`, `--primary`, dll) atau shadcn theme tokens. JANGAN hardcode hex/rgb di component (kecuali untuk hal teknis seperti glassmorphism / animated gradients yang butuh alpha).
- Untuk komponen custom di luar `src/components/ui/`, tempatkan di `src/components/<NamaPascalCase>.tsx`.

### 3. Style Direction: Navy + Single Orange Accent

See **Canonical Visual System** above for the locked palette and **Hard UI Rules** for the no-badge / no-decoration discipline.

### 4. Import & Path Convention

- Path alias WAJIB: `#/*` → `./src/*`.
- Hindari deep relative imports (`../../../`). Gunakan alias `#/`.
- Local imports di-sort: external → internal alias → relative → type-only.

### 5. TypeScript Strictness

- `tsconfig.json` sudah strict. JANGAN `any`. Gunakan `unknown` + type guard atau tipe eksplisit.
- `verbatimModuleSyntax: true` → SELALU pakai `import type` untuk type-only imports.
- Semua function/component harus punya explicit return type ketika tidak trivially inferred.

### 6. Form, Validation, Schema

- Validation: `zod` (v4).
- Form state: TanStack Query mutation via custom hooks (`useSubmitFeedback`, etc).
- Server validation: API routes pakai Zod schemas dari `src/lib/schemas/`.

### 7. Data Fetching Architecture

- **API Client**: `src/lib/api-client.ts` — typed `fetch` wrapper dengan `apiGet`, `apiPost`, `apiPatch`, `apiDelete`.
- **API Routes**: catch-all `src/routes/api/handlers/$.ts` (sudah terimplement untuk articles, projects, team, feedback, admin).
- **TanStack Query** untuk SEMUA server state fetching (NO `useEffect+fetch`).
- **NO server functions (`createServerFn`)** untuk saat ini — pakai API routes + fetch.
- **Service layer** (`src/lib/services/`) hanya untuk server-side di API routes; UI tidak import services.

### 8. Routing (TanStack Router File-Based)

- File routes di `src/routes/`.
- `__root.tsx` = layout global (Header, Footer, Floating AI, providers).
- Setelah tambah/ubah route file: jalan `bun run dev` sekali untuk regenerate `src/routeTree.gen.ts`.
- Navigasi internal pakai `<Link to="/path">` atau `<Link to="/path" params={{...}}>`. JANGAN pakai `<a>` untuk route internal.
- API routes: `createFileRoute('/api/handlers/$')({ server: { handlers: {...} } })`.

### 9. State, Data Fetching, Caching

- Server state: `@tanstack/react-query` (sudah ter-setup dengan `QueryClientProvider`).
- Query keys: centralized factory di `src/lib/domain/query-keys.ts`.
- Component-level state: `useState`/`useReducer`.
- Optimistic updates di mutations where appropriate.

### 10. Styling & Theming

- Tailwind v4 via `@tailwindcss/vite`. CSS variables di `src/styles.css`.
- Dark mode: class `dark` on `<html>`. Theme is locked dark for landing. Project detail and About pages render in shadcn light tokens.
- Brand tokens custom (`--lab-bg`, `--lab-card`, `--lab-card-elevated`, `--lab-orange`, `--lab-orange-soft`, `--lab-line`, `--lab-line-strong`, `--lab-ink`, `--lab-ink-soft`) drive the landing surface. For shadcn primitives and admin pages, fall back to standard shadcn tokens (`bg-background`, `text-foreground`, `bg-primary`, `text-accent`).
- Animation: Motion (`motion/react`). Honor `prefers-reduced-motion`.

### 11. Environment & Secrets

- ENV didefinisikan di `src/env.ts` via `@t3-oss/env-core`.
- `.env.local` di-gitignore. JANGAN commit secrets.
- Better Auth secret: `BETTER_AUTH_SECRET` (generate via `bunx @better-auth/cli secret`).
- `DATABASE_URL` dari `.env.local` untuk Prisma + Better Auth.

### 12. Quality Gates Sebelum Claim "Selesai"

- Wajib: `bun run build` lulus tanpa error.
- Wajib: `bun run test` lulus (Vitest).
- Wajib: `bun run typecheck` bersih (tsc --noEmit).
- File baru di `src/components/ui/` (shadcn-generated) boleh ada komen dari upstream, tapi file buatan kita harus遵守 rule (1).

### 13. Dilarang (Hard Bans)

- ❌ Komentar di kode (rule #1).
- ❌ Inline style `style={{...}}` kecuali untuk value dinamis yang tidak mungkin di-Tailwind-kan.
- ❌ `console.log` di production code.
- ❌ Import dari `node_modules` yang tidak ada di `package.json`.
- ❌ Mengubah `routeTree.gen.ts` secara manual.
- ❌ Menambah file `.env*` apapun ke git.
- ❌ Install library UI lain selain shadcn ecosystem.
- ❌ `createServerFn()` (use API routes + fetch instead).
- ❌ Decorative badges / pills / chips / floating labels / category tags anywhere on landing.
- ❌ Per-section gradient / kicker badge / uppercase metadata strip.
- ❌ Multiple accent colors per section.
- ❌ Hardcoded hex colors in components (use `var(--lab-*)` from `styles.css`).
- ❌ Emerald/green outline button variants (orange only).

### 14. Authentication Pattern

- Better Auth di `src/lib/auth.ts` (Prisma adapter).
- `disableSignUp: true` — public signup tidak diizinkan. Hanya admin yang di-seed.
- Default admin: `admin@xninetzy.local` / password dari seed (lihat `prisma/seed.ts`).
- API routes admin dilindungi `requireAdmin(request)` helper.

## Workflow Singkat

```bash
bun install          # install deps (bun.lock)
bun run dev          # vite dev server (port 3000)
bun run build        # production build
bun run test         # vitest
bun run typecheck    # tsc --noEmit
bun run db:up        # docker compose up -d postgres (pgvector/pgvector:pg16)
bun run db:down      # docker compose stop postgres
bun run db:logs      # tail postgres logs
bun run db:psql      # psql shell ke container
bun run db:reset     # wipe volume + recreate container (HATI-HATI)
bun run db:migrate   # prisma migrate dev
bun run db:studio    # prisma studio
bun run db:seed      # populate admin + sample content
bunx shadcn@latest add <component>  # tambah shadcn component
```

### Database & pgvector

- Postgres 16 via Docker (`pgvector/pgvector:pg16`). Init script di `docker/postgres/init.sql` enable extension `vector` saat container pertama kali start.
- Default port `5433` di `.env.local` (karena `5432` sudah dipakai project lain).
- Untuk kolom vector di Prisma: gunakan `Unsupported("vector(N)")?` di schema. Query via `prisma.$queryRaw` (Prisma 7 belum support pgvector secara native).
- `bun run db:reset` akan **menghapus semua data**. Konfirmasi dulu kalau ada data penting.

## Repository Structure

```
src/
├── components/
│   ├── ui/                          # shadcn primitives (button, input, dialog, etc)
│   ├── ai/                          # Floating AI assistant
│   │   ├── FloatingAIButton.tsx
│   │   ├── AIAssistantDialog.tsx
│   │   ├── AIAssistantHeader.tsx
│   │   ├── AIMessageList.tsx
│   │   ├── AIMessage.tsx
│   │   └── AIQuickActions.tsx
│   ├── hero/                        # Hero composition
│   │   ├── HeroSection.tsx
│   │   ├── HeroBackground.tsx
│   │   ├── BriefBuilder.tsx
│   │   ├── BriefNode.tsx
│   │   └── WorkflowRail.tsx
│   ├── home/                        # Homepage sections (index.tsx composition order)
│   │   ├── AgenticVisualizer.tsx    # Always-animating pipeline (React Flow)
│   │   ├── ArchitectureGraph.tsx
│   │   ├── WorkflowCanvas.tsx
│   │   ├── ServicesGrid.tsx
│   │   ├── ProcessTimeline.tsx
│   │   ├── TechStackGrid.tsx
│   │   ├── ClientLogos.tsx          # Marquee
│   │   ├── TestimonialCarousel.tsx
│   │   ├── ContactSection.tsx       # Brief form + WA/Email aside
│   │   └── FinalCTA.tsx
│   ├── projects/                    # Project cards shared
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── XninetzyLogo.tsx             # Brand mark (PNG)
├── hooks/                           # TanStack Query hooks
│   ├── useArticles.ts
│   ├── useProjects.ts
│   ├── useTeamMembers.ts
│   ├── useFeedback.ts
│   ├── useBriefs.ts
│   ├── useAdminArticles.ts
│   ├── useAdminProjects.ts
│   ├── useAdminTeam.ts
│   ├── useAdminFeedback.ts
│   └── useAIChat.ts                 # Floating AI logic (local state)
├── lib/
│   ├── api-client.ts                # fetch wrapper (apiGet, apiPost, apiPatch, apiDelete)
│   ├── motion-variants.ts           # shared Motion variants (fadeInUp, stagger, etc)
│   ├── slug.ts                      # SLUG_REGEX, slugify(), isValidSlug()
│   ├── utils.ts                     # cn() helper
│   ├── domain/                      # Centralized constants
│   │   ├── routes.ts
│   │   ├── services.ts              # SERVICE_OFFERINGS + CONTACT_INFO
│   │   ├── clients.ts               # CLIENT_LOGOS + TESTIMONIALS
│   │   └── ...
│   ├── schemas/                     # Zod schemas (article, project, team, feedback, brief)
│   ├── services/                    # Server-side DB access (API routes only)
│   ├── auth.ts                      # Better Auth (server-only)
│   └── auth-client.ts
├── routes/
│   ├── __root.tsx                   # Layout + SEO meta + Floating AI mount
│   ├── index.tsx                    # Landing composition
│   ├── research.tsx                 # Articles index
│   ├── projects.tsx                 # Projects index
│   ├── about.tsx                    # Team + manifesto (light theme)
│   ├── admin.tsx + admin/           # Admin dashboard (login, briefs, team, ...)
│   └── api/
│       ├── auth/$.ts                # Better Auth handler
│       └── handlers/$.ts            # Catch-all API (public + admin)
├── styles.css                       # Canonical visual tokens + global styles
├── db.ts                            # Prisma client (server-only)
├── router.tsx                       # TanStack Router instance
├── env.ts                           # T3Env validation
├── generated/prisma/                # Prisma generated client
prisma/
├── schema.prisma                    # Data model
├── seed.ts                          # Admin user + sample content
└── migrations/                      # Generated migrations
docker/
├── postgres/init.sql                 # CREATE EXTENSION vector
└── docker-compose.yml                # pgvector/pgvector:pg16
docs/
├── superpowers/
│   ├── specs/                       # Design docs
│   └── plans/                       # Implementation plans
└── ui/                              # Wireframes
```

## Data Model Overview

```prisma
User { id, name, email, emailVerified, image, role: UserRole, createdAt }
  ├─ Session[] (Better Auth)
  ├─ Account[] (Better Auth)
  └─ Article[] (author relation)

Article { id, title, slug, excerpt, content, coverImage, status, publishedAt, readingTime, categoryId, authorId, embedding(Unsupported<vector(1536)>) }
  ├─ author: User
  ├─ category: Category
  └─ tags: TagOnArticle[] → Tag[]

Project { id, title, slug, description, content, coverImage, technologies[], categoryId, githubUrl, demoUrl, featured, order }

TeamMember { id, name, role, bio, avatar, github, linkedin, website, featured, order }

Feedback { id, name, email, message, type: FeedbackType, status: FeedbackStatus, createdAt, updatedAt }

Category { id, slug, name }
Tag { id, slug, name }
```

Enums: `UserRole` (READER, EDITOR, ADMIN), `ArticleStatus` (DRAFT, PUBLISHED, ARCHIVED), `FeedbackType`, `FeedbackStatus`.

## Conventions Tambahan

- Penamaan file: PascalCase untuk component, camelCase untuk util/hook/data.
- File-route component: default export, nama function deskriptif.
- Data fetching hooks: prefix `use` (e.g., `useArticles`, `useSubmitFeedback`).
- API routes: di `src/routes/api/handlers/$.ts` (catch-all).
- Domain constants: di `src/lib/domain/`, typed `as const`.

## Source-of-Truth Hierarchy

1. `AGENTS.md` (file ini) — aturan engineering
2. `docs/superpowers/specs/` — design docs untuk fitur besar
3. `docs/superpowers/plans/` — implementation plans
4. `docs/ui/` — wireframes
5. `prisma/schema.prisma` — data model
6. `src/components/ui/` — shadcn UI primitives
7. `src/styles.css` — design tokens
8. TanStack/Radix/zod/Better Auth docs resmi — library behavior

## Saat Bertanya / Bingung

- Untuk stack/library choice → cek "Non-Negotiable Rules" dulu.
- Untuk design alternatif → tanyakan ke user.
- Untuk perbaikan refactor di luar scope task → buka issue/PR terpisah.

## Engineering Standards Reference

Lihat design doc `docs/superpowers/specs/2026-09-10-xninetzy-labs-platform-design.md` §6 untuk engineering standards lengkap (TanStack Query patterns, Zod validation, custom hooks, clean components, dll).

## Pre-PR Checklist (UI)

Before opening a PR that touches the landing surface, run this audit:

1. **No badge / pill / chip / floating label** anywhere new. Use typography, weight, grid, borders for hierarchy.
2. **No emerald/green outline button** — orange is the single accent.
3. **No hardcoded hex** — only `var(--lab-*)` tokens via Tailwind arbitrary values.
4. **No per-section gradient backdrop** outside the hero `HeroBackground`.
5. **Tech stack rendered editorially** (`<ul>` / mono `·`-joined text / grid-with-hairline), not as a pill wall.
6. **Step indicators** are large mono numbers (`01`), not small badges.
7. **Brief Builder** keeps only functional chip controls. No `LIVE` pill, no decorative sample chips.
8. **Run** `bun run typecheck && bun run build && bun run test` and confirm clean.
