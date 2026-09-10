import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { categoryKeys } from "#/lib/domain/query-keys"
import { apiDelete, apiGet, apiPatch, apiPost } from "#/lib/api-client"
import type {
  CategoryCreateInput,
  CategoryUpdateInput,
} from "#/lib/schemas/category"

export type CategoryItem = {
  id: string
  slug: string
  name: string
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => apiGet<CategoryItem[]>("/api/handlers/admin/categories"),
  })
}

export function useAdminCategory(id: string) {
  return useQuery({
    queryKey: [...categoryKeys.all, "admin", "detail", id],
    queryFn: () => apiGet<CategoryItem>(`/api/handlers/admin/categories/${id}`),
    enabled: id.length > 0,
  })
}

export function useAdminCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryCreateInput) =>
      apiPost<CategoryItem>("/api/handlers/admin/categories", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useAdminUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryUpdateInput) =>
      apiPatch<CategoryItem>(`/api/handlers/admin/categories/${input.id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useAdminDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/handlers/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}
