import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { feedbackKeys } from "#/lib/domain/query-keys"
import { apiDelete, apiGet, apiPatch } from "#/lib/api-client"
import {
  FEEDBACK_STATUS,
  FEEDBACK_TYPE,
  type FeedbackStatus,
  type FeedbackType,
} from "#/lib/domain/feedback"
import type { FeedbackStatusUpdateInput } from "#/lib/schemas/feedback"

export type FeedbackAdminItem = {
  id: string
  name: string
  email: string
  message: string
  type: FeedbackType
  status: FeedbackStatus
  createdAt: string | Date
  updatedAt: string | Date
}

type AdminListFilters = {
  status?: FeedbackStatus
  type?: FeedbackType
}

export function useAdminFeedback(filters: AdminListFilters = {}) {
  return useQuery({
    queryKey: feedbackKeys.adminListFiltered(filters),
    queryFn: () => apiGet<FeedbackAdminItem[]>("/api/handlers/admin/feedback", filters),
  })
}

export function useAdminUpdateFeedbackStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: FeedbackStatusUpdateInput) =>
      apiPatch<FeedbackAdminItem>(`/api/handlers/admin/feedback/${input.id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all })
    },
  })
}

export function useAdminDeleteFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/handlers/admin/feedback/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all })
    },
  })
}

export { FEEDBACK_STATUS, FEEDBACK_TYPE }
