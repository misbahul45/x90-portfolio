import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { projectKeys } from "#/lib/domain/query-keys"
import { apiDelete, apiGet, apiPatch, apiPost } from "#/lib/api-client"
import type {
  ProjectCreateInput,
  ProjectUpdateInput,
} from "#/lib/schemas/project"
import type { ProjectListItem } from "#/hooks/useProjects"

export function useAdminProjects() {
  return useQuery({
    queryKey: [...projectKeys.all, "admin", "list"],
    queryFn: () => apiGet<ProjectListItem[]>("/api/handlers/admin/projects"),
  })
}

export function useAdminProject(id: string) {
  return useQuery({
    queryKey: [...projectKeys.all, "admin", "detail", id],
    queryFn: () => apiGet<ProjectListItem>(`/api/handlers/admin/projects/${id}`),
    enabled: id.length > 0,
  })
}

export function useAdminCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectCreateInput) =>
      apiPost<ProjectListItem>("/api/handlers/admin/projects", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useAdminUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectUpdateInput) =>
      apiPatch<ProjectListItem>(`/api/handlers/admin/projects/${input.id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useAdminDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/handlers/admin/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}
