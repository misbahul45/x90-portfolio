# XNINETZY LABS — Low-Fidelity Wireframes

> **Status**: Reference for visual structure & section order (NOT styling)
> **Date**: 2026-09-10
> **Convention**: All pages are Mermaid `flowchart TD`. Each node = one section/block. `[lo-fi]` markers = placeholder visuals.
> **Companion docs**: `docs/superpowers/specs/2026-09-10-xninetzy-labs-platform-design.md` · `docs/superpowers/plans/2026-09-10-xninetzy-labs-platform-plan.md`

---

## 1. Homepage `/`

```mermaid
flowchart TD
  HDR["⬡ HEADER — sticky\nXNINETZY LABS | Research Build Projects About | [Let's Build]"]
  HERO["⬡ HERO\nRESEARCH. EXPERIMENT. BUILD.\nsub: We explore ML, LLMs, intelligent systems...\n[Explore Research] [Work With Us]\n─── terminal/agent-runtime visual ───"]
  RES["⬡ RESEARCH SIGNAL\nTopics: LLM · ML · DL · RAG · Agents · Data\nmini activity bars [lo-fi]"]
  BLD["⬡ BUILD INTELLIGENT SYSTEMS\n5 capability cards:\n01 AI Automation | 02 Web & App | 03 Agentic Systems\n04 AI Assistants | 05 Data Intelligence\neach card → mini architecture diagram [lo-fi]"]
  SHW["⬡ INSIDE THE SYSTEM — signature\nReact Flow graph: INPUT→PLANNER→RAG/TOOLS/MEMORY→REASONER→OUTPUT\nanimated execution state + side panel + code panel"]
  PROJ["⬡ SELECTED PROJECTS\n3 featured cards [database-driven]\ncover · category · title · desc · stack"]
  RES2["⬡ LATEST RESEARCH\n6 article cards · filter All/LLM/RAG/ML/Agents/Data\ncategory · title · excerpt · date · read time"]
  TEAM["⬡ THE LAB\n4 member cards · avatar · name · role · links"]
  FB["⬡ FEEDBACK — What are you building?\nform: name email type message → API → DB → admin\nrecent feedback preview [lo-fi]"]
  CTA["⬡ FINAL CTA\nHave a problem worth engineering?\n[Start a Project] [Explore Research]"]
  FTR["⬡ FOOTER\nbrand · Research / Build / Lab columns · © 2026"]
  FAB["⬡ FLOATING AI BUTTON (global)\n✦ Ask Labs → dialog overlay\ncontext-aware · execution timeline · no /chat route"]

  HDR --> HERO --> RES --> BLD --> SHW --> PROJ --> RES2 --> TEAM --> FB --> CTA --> FTR
  FAB -.-> HERO
```

---

## 2. Research Listing `/research`

```mermaid
flowchart TD
  HDR["⬡ HEADER (shared)"]
  BC["⬡ BREADCRUMB\nHome / Research"]
  TTL["⬡ PAGE TITLE\nLATEST RESEARCH\nsub: Experiments, engineering notes, and ideas from the lab."]
  FLT["⬡ FILTER BAR\nAll · LLM · RAG · ML · Deep Learning · Agents · Data\nsearch input [lo-fi]"]
  LIST["⬡ ARTICLE GRID\n3-column editorial cards:\n[cover image] [category tag] [title] [excerpt] [author · date · read time]\nrepeated × N"]
  PAG["⬡ PAGINATION\n← Prev  1 2 3 ...  Next →"]
  FTR["⬡ FOOTER (shared)"]
  FAB["⬡ FLOATING AI BUTTON"]

  HDR --> BC --> TTL --> FLT --> LIST --> PAG --> FTR
  FAB -.-> LIST
```

---

## 3. Article Detail `/research/[slug]`

```mermaid
flowchart TD
  HDR["⬡ HEADER (shared)"]
  BC["⬡ BREADCRUMB\nHome / Research / [category]"]
  CAT["⬡ CATEGORY TAG\n[ LLM ]"]
  TTL["⬡ ARTICLE TITLE\nBuilding Long-Context Retrieval Systems...\nexcerpt · author · published date · read time"]
  CVR["⬡ COVER IMAGE [lo-fi]"]
  BODY["⬡ ARTICLE BODY (Tiptap content)\nheadings · paragraphs · code blocks · blockquotes\nlists · images · tables · callouts · inline code\npremium long-form technical typography"]
  TOC["⬡ TABLE OF CONTENTS (sticky sidebar)\n- Introduction\n- Method\n- Results\n- Conclusion"]
  REL["⬡ RELATED RESEARCH\n3 related article cards [lo-fi]"]
  CTA2["⬡ INLINE CTA\nDiscuss this research → [Work With Us]"]
  FTR["⬡ FOOTER (shared)"]
  FAB["⬡ FLOATING AI BUTTON\ncontext: currentArticleId, currentTitle"]

  HDR --> BC --> CAT --> TTL --> CVR --> BODY
  TOC -.-> BODY
  BODY --> REL --> CTA2 --> FTR
  FAB -.-> BODY
```

---

## 4. Projects Listing `/projects`

```mermaid
flowchart TD
  HDR["⬡ HEADER (shared)"]
  BC["⬡ BREADCRUMB\nHome / Projects"]
  TTL["⬡ PAGE TITLE\nPROJECTS\nsub: Systems we've engineered from research."]
  FLT["⬡ FILTER BAR\nAll · Agentic Systems · RAG · AI Automation · Web & App · Data Intelligence"]
  GRID["⬡ PROJECT GRID\n3-column case-study cards:\n[cover image] [category] [title] [description] [stack tags] [github] [demo]\n[View Project →]\nrepeated × N"]
  PAG["⬡ PAGINATION"]
  FTR["⬡ FOOTER (shared)"]
  FAB["⬡ FLOATING AI BUTTON"]

  HDR --> BC --> TTL --> FLT --> GRID --> PAG --> FTR
  FAB -.-> GRID
```

---

## 5. Project Detail `/projects/[slug]`

```mermaid
flowchart TD
  HDR["⬡ HEADER (shared)"]
  BC["⬡ BREADCRUMB\nHome / Projects / [category]"]
  CAT["⬡ CATEGORY TAG"]
  TTL["⬡ PROJECT TITLE\nMulti-Agent Research Assistant\nshort description"]
  META["⬡ META ROW\nstack tags · github URL · demo URL · date"]
  CVR["⬡ COVER IMAGE [lo-fi]"]
  ARCH["⬡ ARCHITECTURE SECTION\nmini React Flow / system diagram [lo-fi]\nInput → Planner → Retriever → Tools → Reasoner → Output"]
  BODY["⬡ PROJECT BODY\nProblem · Solution · Architecture · Impact\ncode blocks · diagrams · screenshots"]
  REL["⬡ RELATED PROJECTS\n2-3 related cards [lo-fi]"]
  CTA2["⬡ CTA\nWant something similar? [Start a Project]"]
  FTR["⬡ FOOTER (shared)"]
  FAB["⬡ FLOATING AI BUTTON\ncontext: currentProjectId, currentTitle"]

  HDR --> BC --> CAT --> TTL --> META --> CVR --> ARCH --> BODY --> REL --> CTA2 --> FTR
  FAB -.-> BODY
```

---

## 6. About `/about`

```mermaid
flowchart TD
  HDR["⬡ HEADER (shared)"]
  BC["⬡ BREADCRUMB\nHome / About"]
  TTL["⬡ PAGE TITLE\nABOUT XNINETZY LABS\nResearch · Experiment · Build"]
  MISS["⬡ MISSION STATEMENT\nWe research, experiment, and turn technical ideas into working systems."]
  PILLARS["⬡ THREE PILLARS\nRESEARCH | BUILD | COMMUNITY\neach: description + icon [lo-fi]"]
  TEAM["⬡ FULL TEAM GRID\nall members · avatar · name · role · bio · github · linkedin · website"]
  STATS["⬡ LAB STATS [optional, lo-fi]\narticles published · projects shipped · experiments run"]
  CTA2["⬡ CTA\nBuild with us → [Start a Project]"]
  FTR["⬡ FOOTER (shared)"]
  FAB["⬡ FLOATING AI BUTTON"]

  HDR --> BC --> TTL --> MISS --> PILLARS --> TEAM --> STATS --> CTA2 --> FTR
  FAB -.-> TEAM
```

---

## 7. Admin Dashboard `/admin`

```mermaid
flowchart TD
  ASH["⬡ ADMIN SHELL (protected — reuse existing auth)\nsidebar: Overview · Research · Projects · Team · Feedback · Media\ntopbar: user · logout"]
  OVR["⬡ OVERVIEW\npublished articles · draft articles · projects · team members · feedback count\nrecent activity feed [lo-fi]"]
  FAB["⬡ (no floating AI on admin)"]

  ASH --> OVR
```

---

## 8. Admin — Articles `/admin/articles`

```mermaid
flowchart TD
  ASH["⬡ ADMIN SHELL (shared)"]
  BAR["⬡ ACTION BAR\n[+ New Article] · search · filter: All / Draft / Published"]
  TBL["⬡ ARTICLES TABLE\nTitle | Category | Status | Author | Published Date | Actions [edit][delete]\nrow × N"]
  PAG["⬡ PAGINATION"]
  NEW["⬡ → /admin/articles/new"]
  EDT["⬡ → /admin/articles/[id]"]

  ASH --> BAR --> TBL --> PAG
  BAR --> NEW
  TBL --> EDT
```

---

## 9. Admin — Article Editor `/admin/articles/new` & `/admin/articles/[id]`

```mermaid
flowchart TD
  ASH["⬡ ADMIN SHELL (shared)"]
  BAR2["⬡ EDITOR TOP BAR\n[Preview] [Save Draft] [Publish] · autosave status · [← Back to list]"]
  META["⬡ METADATA PANEL (left or top)\nTitle · Subtitle/Excerpt · Category · Tags · Cover Image [ImageKit upload]\nStatus: Draft / Published · Published Date"]
  EDT["⬡ TIPTAP EDITOR (Notion-like)\nrich text · headings · code blocks · inline code · images\nblockquote · callout · lists · links · tables · divider\nslash command: /heading /code /image /quote /callout /divider"]
  PRV["⬡ PREVIEW MODE (toggle)\nrenders article as public reader sees it"]
  SAVE["⬡ SAVE / PUBLISH FLOW\nautosave → draft status\npublish → publishedAt set → public API exposes article"]

  ASH --> BAR2 --> META --> EDT
  BAR2 --> PRV
  EDT --> SAVE
```

---

## 10. Admin — Projects `/admin/projects`

```mermaid
flowchart TD
  ASH["⬡ ADMIN SHELL (shared)"]
  BAR["⬡ ACTION BAR\n[+ New Project] · search · filter by category"]
  TBL["⬡ PROJECTS TABLE\nTitle | Category | Featured | Tech | Created | Actions [edit][delete]\nrow × N"]
  FORM["⬡ → PROJECT FORM (/new or /[id])\nTitle · Slug · Description · Content (Tiptap)\nCover Image [ImageKit] · Technologies [] · Category\nGitHub URL · Demo URL · Featured toggle"]
  PAG["⬡ PAGINATION"]

  ASH --> BAR --> TBL --> PAG
  BAR --> FORM
```

---

## 11. Admin — Team `/admin/team`

```mermaid
flowchart TD
  ASH["⬡ ADMIN SHELL (shared)"]
  BAR["⬡ ACTION BAR\n[+ Add Member]"]
  TBL["⬡ TEAM TABLE\nName | Role | Featured | Order | Actions [edit][delete]\nrow × N"]
  FORM["⬡ → MEMBER FORM\nName · Role · Bio · Avatar [ImageKit]\nGitHub · LinkedIn · Website · Featured · Order"]

  ASH --> BAR --> TBL
  BAR --> FORM
```

---

## 12. Admin — Feedback `/admin/feedback`

```mermaid
flowchart TD
  ASH["⬡ ADMIN SHELL (shared)"]
  BAR["⬡ FILTER BAR\nAll · General · Project · Research · Collaboration · Other\nsearch · sort by date"]
  LIST["⬡ FEEDBACK INBOX\nName | Email | Type | Message preview | Date | Status [new/read]\n[view] [update status] [delete]\nrow × N"]
  DET["⬡ → DETAIL VIEW\nFull message · name · email · type · date\n[Mark Read] [Reply via email] [Archive] [Delete]"]
  FLOW["⬡ DATA FLOW (reference)\nFrontend → API → Validation (Zod) → DB → Admin inbox"]

  ASH --> BAR --> LIST
  LIST --> DET
  DET -.-> FLOW
```

---

## 13. Floating AI Dialog (global — semua halaman public)

```mermaid
flowchart TD
  TRG["⬡ FLOATING BUTTON (bottom-right)\n✦ Ask Labs — click to open"]
  DLG["⬡ AI DIALOG OVERLAY\n── header ──\n✦ XNINETZY LABS · Research Assistant · ● Online · [✕]\n── body ──\nquick actions: Research · Projects · Services · Collaboration\nexecution timeline: Analyzing → Retrieving → Reasoning → Response\nmessage list (markdown · code · links)\n── input ──\n[Ask anything about the lab...] [↑ send]"]
  CTX["⬡ CONTEXT AWARENESS\npasses to backend:\ncurrentPath · currentPageType · currentArticleId · currentProjectId · currentTitle"]
  BE["⬡ BACKEND (reuse existing AI service)\nendpoint via existing API pattern\nreturns execution stages + response"]

  TRG -->|click| DLG
  DLG --> CTX --> BE
  BE -->|stream response| DLG
  DLG -->|Escape / ✕ / backdrop| TRG
```

---

## 14. Route Map — Public vs Admin

```mermaid
flowchart LR
  subgraph PUB ["PUBLIC SITE"]
    HOME[" / "]
    RES[" /research "]
    ART[" /research/[slug] "]
    PROJ[" /projects "]
    PJT[" /projects/[slug] "]
    ABT[" /about "]
  end

  subgraph ADM ["ADMIN (protected — existing auth)"]
    DASH[" /admin "]
    AART[" /admin/articles "]
    ANEW[" /admin/articles/new "]
    AEDT[" /admin/articles/[id] "]
    APRJ[" /admin/projects "]
    ATM[" /admin/team "]
    AFB[" /admin/feedback "]
  end

  FAB[" ✦ Floating AI Dialog\n(global, no route) "]

  HOME --> RES --> ART
  HOME --> PROJ --> PJT
  HOME --> ABT
  FAB -.-> HOME
  FAB -.-> RES
  FAB -.-> ART
  FAB -.-> PROJ
  FAB -.-> PJT
  FAB -.-> ABT
  DASH --> AART --> ANEW
  AART --> AEDT
  DASH --> APRJ
  DASH --> ATM
  DASH --> AFB
```

---

## 15. Brand Architecture (referensi struktur)

```mermaid
flowchart TD
  ROOT["XNINETZY LABS\nResearch Lab × Software Engineering × AI Systems"]

  subgraph THREE ["Three Faces — One Brand"]
    R["RESEARCH\nArticles · Experiments · Notes\nML · DL · LLM · RAG · Agents"]
    B["BUILD\nAutomation · Web/App · Agentic Systems\nAI Assistants · Data Intelligence"]
    C["COMMUNITY\nTeam · Projects · Feedback\nDiscussion · Knowledge Sharing"]
  end

  ROOT --> THREE
  R --> OUT["AI / SOFTWARE\nexperiments → systems → useful products"]
  B --> OUT
  C --> OUT
```
