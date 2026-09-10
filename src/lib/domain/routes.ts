export const ROUTES = {
  HOME: "/",
  RESEARCH: "/research",
  RESEARCH_DETAIL: (slug: string) => `/research/${slug}` as const,
  PROJECTS: "/projects",
  PROJECT_DETAIL: (slug: string) => `/projects/${slug}` as const,
  ABOUT: "/about",
  ADMIN: "/admin",
  ADMIN_ARTICLES: "/admin/articles",
  ADMIN_ARTICLE_NEW: "/admin/articles/new",
  ADMIN_PROJECTS: "/admin/projects",
  ADMIN_TEAM: "/admin/team",
  ADMIN_FEEDBACK: "/admin/feedback",
  AUTH_SIGN_IN: "/api/auth/sign-in",
  AUTH_SIGN_UP: "/api/auth/sign-up",
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
