import { useQuery } from "@tanstack/react-query"
import { teamKeys } from "#/lib/domain/query-keys"
import { apiGet } from "#/lib/api-client"

export type TeamMemberItem = {
  id: string
  name: string
  role: string
  bio: string | null
  avatar: string | null
  github: string | null
  linkedin: string | null
  website: string | null
  featured: boolean
  order: number
}

export function useTeamMembers(filters: { featuredOnly?: boolean } = {}) {
  return useQuery({
    queryKey: teamKeys.list(filters),
    queryFn: () => apiGet<TeamMemberItem[]>("/api/handlers/team", filters),
  })
}
