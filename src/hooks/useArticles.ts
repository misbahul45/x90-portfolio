import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { articleKeys } from "#/lib/domain/query-keys"
import { apiGet } from "#/lib/api-client"
import type { ArticleStatus } from "#/lib/domain/article-status"

export type ArticleListItem = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  status: ArticleStatus
  publishedAt: string | Date | null
  readingTime: number | null
  author: { id: string; name: string; email: string; image: string | null }
  category: { id: string; slug: string; name: string } | null
  tags: Array<{ tag: { id: string; slug: string; name: string } }>
}

export type ArticlePage = {
  items: ArticleListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export function useArticles(
  filters: { categorySlug?: string; page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: articleKeys.list(filters),
    queryFn: () => apiGet<ArticlePage>("/api/handlers/articles", filters),
  })
}

export type InfiniteArticleFilters = {
  categorySlug?: string
  pageSize?: number
}

export function useInfiniteArticles(filters: InfiniteArticleFilters = {}) {
  const pageSize = filters.pageSize ?? 9
  return useInfiniteQuery({
    queryKey: articleKeys.infinite({ categorySlug: filters.categorySlug }),
    queryFn: ({ pageParam }) =>
      apiGet<ArticlePage>("/api/handlers/articles", {
        ...(filters.categorySlug ? { categorySlug: filters.categorySlug } : {}),
        page: pageParam,
        pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  })
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: articleKeys.detail(slug),
    queryFn: () => apiGet<ArticleListItem>(`/api/handlers/articles/${slug}`),
    enabled: slug.length > 0,
  })
}
