import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { articleKeys } from "#/lib/domain/query-keys"
import { apiDelete, apiGet, apiPatch, apiPost } from "#/lib/api-client"
import type {
  ArticleCreateInput,
  ArticleUpdateInput,
} from "#/lib/schemas/article"
import type { ArticleListItem } from "#/hooks/useArticles"
import type { ArticleStatus } from "#/lib/domain/article-status"

export function useAdminArticles(filters: {
  status?: ArticleStatus
  categorySlug?: string
} = {}) {
  return useQuery({
    queryKey: [...articleKeys.all, "admin", "list", filters],
    queryFn: () => apiGet<ArticleListItem[]>("/api/handlers/admin/articles", filters),
  })
}

export function useAdminArticle(id: string) {
  return useQuery({
    queryKey: [...articleKeys.all, "admin", "detail", id],
    queryFn: () => apiGet<ArticleListItem>(`/api/handlers/admin/articles/${id}`),
    enabled: id.length > 0,
  })
}

export function useAdminCreateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ArticleCreateInput) =>
      apiPost<ArticleListItem>("/api/handlers/admin/articles", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all })
    },
  })
}

export function useAdminUpdateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ArticleUpdateInput) =>
      apiPatch<ArticleListItem>(`/api/handlers/admin/articles/${input.id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all })
    },
  })
}

export function useAdminDeleteArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/handlers/admin/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all })
    },
  })
}
