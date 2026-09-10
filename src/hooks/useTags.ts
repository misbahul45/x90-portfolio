import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { tagKeys } from "#/lib/domain/query-keys"
import { apiDelete, apiGet, apiPatch, apiPost } from "#/lib/api-client"
import type { TagCreateInput, TagUpdateInput } from "#/lib/schemas/tag"

export type TagItem = {
  id: string
  slug: string
  name: string
}

export function useTags() {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: () => apiGet<TagItem[]>("/api/handlers/admin/tags"),
  })
}

export function useAdminTag(id: string) {
  return useQuery({
    queryKey: [...tagKeys.all, "admin", "detail", id],
    queryFn: () => apiGet<TagItem>(`/api/handlers/admin/tags/${id}`),
    enabled: id.length > 0,
  })
}

export function useAdminCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TagCreateInput) =>
      apiPost<TagItem>("/api/handlers/admin/tags", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}

export function useAdminUpdateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TagUpdateInput) =>
      apiPatch<TagItem>(`/api/handlers/admin/tags/${input.id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}

export function useAdminDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/handlers/admin/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
  })
}
