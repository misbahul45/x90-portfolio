type ArticleListFilters = {
  categorySlug?: string
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  limit?: number
  page?: number
  pageSize?: number
}

type ProjectListFilters = {
  featuredOnly?: boolean
  categorySlug?: string
  page?: number
  pageSize?: number
}

type TeamListFilters = {
  featuredOnly?: boolean
}

type FeedbackListFilters = {
  status?: "NEW" | "READ" | "ARCHIVED"
  type?: "GENERAL" | "PROJECT" | "RESEARCH" | "COLLABORATION" | "OTHER"
}

export const articleKeys = {
  all: ["articles"] as const,
  lists: () => [...articleKeys.all, "list"] as const,
  list: (filters: ArticleListFilters) =>
    [...articleKeys.lists(), filters] as const,
  infinite: (filters: Omit<ArticleListFilters, "page">) =>
    [...articleKeys.lists(), "infinite", filters] as const,
  details: () => [...articleKeys.all, "detail"] as const,
  detail: (slug: string) => [...articleKeys.details(), slug] as const,
}

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: ProjectListFilters) =>
    [...projectKeys.lists(), filters] as const,
  infinite: (filters: Omit<ProjectListFilters, "page">) =>
    [...projectKeys.lists(), "infinite", filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (slug: string) => [...projectKeys.details(), slug] as const,
}

export const teamKeys = {
  all: ["team"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (filters: TeamListFilters) =>
    [...teamKeys.lists(), filters] as const,
}

export const feedbackKeys = {
  all: ["feedback"] as const,
  public: () => [...feedbackKeys.all, "public"] as const,
  adminList: () => [...feedbackKeys.all, "admin", "list"] as const,
  adminListFiltered: (filters: FeedbackListFilters) =>
    [...feedbackKeys.adminList(), filters] as const,
}

type BriefListFilters = {
  status?: "NEW" | "REVIEWED" | "QUOTED" | "ARCHIVED"
  service?: "AUTOMATION" | "AI_ASSISTANT" | "AGENTIC_SYSTEM" | "WEB" | "MOBILE" | "OTHER"
}

export const briefKeys = {
  all: ["briefs"] as const,
  adminList: () => [...briefKeys.all, "admin", "list"] as const,
  adminListFiltered: (filters: BriefListFilters) =>
    [...briefKeys.adminList(), filters] as const,
}

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: () => [...categoryKeys.lists()] as const,
}

export const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  list: () => [...tagKeys.lists()] as const,
}
