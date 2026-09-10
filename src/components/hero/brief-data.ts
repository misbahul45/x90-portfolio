import type { LucideIcon } from "lucide-react"
import {
  Bot,
  Brain,
  Database,
  Gauge,
  Layers,
  MessageSquare,
  Smartphone,
  Sparkles,
  Wand2,
  Wrench,
  Zap,
} from "lucide-react"

export type StepId = "project" | "problem" | "audience" | "priorities" | "success"

export type BriefState = {
  projectType: string | null
  problem: string
  audience: string | null
  priorities: string[]
  success: string
}

export const PROJECT_OPTIONS: ReadonlyArray<{ key: string; label: string; icon: LucideIcon }> = [
  { key: "ai", label: "AI product", icon: Brain },
  { key: "web", label: "Web app", icon: Layers },
  { key: "mobile", label: "Mobile app", icon: Smartphone },
  { key: "automation", label: "Automation", icon: Zap },
  { key: "internal", label: "Internal tool", icon: Wrench },
  { key: "data", label: "Data platform", icon: Database },
  { key: "other", label: "Something else", icon: Sparkles },
]

export const AI_CAPABILITIES: ReadonlyArray<{ key: string; label: string; icon: LucideIcon }> = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "rag", label: "RAG", icon: Database },
  { key: "agents", label: "Agents", icon: Bot },
  { key: "recs", label: "Recommendations", icon: Wand2 },
  { key: "vision", label: "Vision", icon: Gauge },
]

export const MOBILE_PLATFORMS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "ios", label: "iOS" },
  { key: "android", label: "Android" },
  { key: "cross", label: "Cross-platform" },
]

export const INTERNAL_USERS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "ops", label: "Operations" },
  { key: "admin", label: "Admin" },
  { key: "sales", label: "Sales" },
  { key: "finance", label: "Finance" },
  { key: "eng", label: "Engineering" },
]

export const AUDIENCE_OPTIONS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "customers", label: "Customers" },
  { key: "internal", label: "Internal team" },
  { key: "students", label: "Students" },
  { key: "enterprise", label: "Enterprise" },
  { key: "public", label: "Public users" },
  { key: "other", label: "Other" },
]

export const PRIORITY_OPTIONS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "speed", label: "Speed" },
  { key: "reliability", label: "Reliability" },
  { key: "ai", label: "AI capability" },
  { key: "scale", label: "Scalability" },
  { key: "ux", label: "Beautiful UX" },
  { key: "automation", label: "Automation" },
  { key: "data", label: "Data / analytics" },
]

export const SUGGESTED_PROMPTS: ReadonlyArray<string> = [
  "AI customer support platform",
  "Internal workflow automation",
  "Mobile learning app",
  "Data dashboard for ops",
]

export const STEPS: ReadonlyArray<{
  id: StepId
  index: string
  title: string
  prompt: string
  hint: string
  kind: "choice" | "text" | "multi"
}> = [
  {
    id: "project",
    index: "01",
    title: "Project",
    prompt: "What are you building?",
    hint: "Pick the closest fit — we refine it together.",
    kind: "choice",
  },
  {
    id: "problem",
    index: "02",
    title: "Problem",
    prompt: "What problem should it solve?",
    hint: "Short sentence is enough. We expand on it.",
    kind: "text",
  },
  {
    id: "audience",
    index: "03",
    title: "Audience",
    prompt: "Who will use it?",
    hint: "Pick one or two.",
    kind: "choice",
  },
  {
    id: "priorities",
    index: "04",
    title: "Priorities",
    prompt: "What matters most?",
    hint: "Multi-select. Drives the architecture.",
    kind: "multi",
  },
  {
    id: "success",
    index: "05",
    title: "Outcome",
    prompt: "What would success look like?",
    hint: "Concrete metric or moment. We'll measure against it.",
    kind: "text",
  },
]
