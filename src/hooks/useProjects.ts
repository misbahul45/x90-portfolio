import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { projectKeys } from "#/lib/domain/query-keys"
import { apiGet } from "#/lib/api-client"

export type ProjectListItem = {
  id: string
  title: string
  slug: string
  description: string
  content: string
  coverImage: string | null
  technologies: string[]
  githubUrl: string | null
  demoUrl: string | null
  featured: boolean
  order: number
  category: { id: string; slug: string; name: string } | null
}

export type ProjectPage = {
  items: ProjectListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export function useProjects(
  filters: { featuredOnly?: boolean; categorySlug?: string; page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => apiGet<ProjectPage>("/api/handlers/projects", filters),
  })
}

export type InfiniteProjectFilters = {
  featuredOnly?: boolean
  categorySlug?: string
  pageSize?: number
}

export function useInfiniteProjects(filters: InfiniteProjectFilters = {}) {
  const pageSize = filters.pageSize ?? 9
  return useInfiniteQuery({
    queryKey: projectKeys.infinite({ featuredOnly: filters.featuredOnly, categorySlug: filters.categorySlug }),
    queryFn: ({ pageParam }) =>
      apiGet<ProjectPage>("/api/handlers/projects", {
        ...(filters.featuredOnly ? { featuredOnly: true } : {}),
        ...(filters.categorySlug ? { categorySlug: filters.categorySlug } : {}),
        page: pageParam,
        pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  })
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: projectKeys.detail(slug),
    queryFn: () => apiGet<ProjectListItem>(`/api/handlers/projects/${slug}`),
    enabled: slug.length > 0,
  })
}
