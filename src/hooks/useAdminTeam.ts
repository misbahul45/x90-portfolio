import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { teamKeys } from "#/lib/domain/query-keys"
import { apiDelete, apiGet, apiPatch, apiPost } from "#/lib/api-client"
import type {
  TeamMemberInput,
  TeamMemberUpdateInput,
} from "#/lib/schemas/team-member"
import type { TeamMemberItem } from "#/hooks/useTeamMembers"

export function useAdminTeam() {
  return useQuery({
    queryKey: [...teamKeys.all, "admin", "list"],
    queryFn: () => apiGet<TeamMemberItem[]>("/api/handlers/admin/team"),
  })
}

export function useAdminCreateTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TeamMemberInput) => apiPost<TeamMemberItem>("/api/handlers/admin/team", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

export function useAdminUpdateTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TeamMemberUpdateInput) =>
      apiPatch<TeamMemberItem>(`/api/handlers/admin/team/${input.id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

export function useAdminDeleteTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/handlers/admin/team/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}
