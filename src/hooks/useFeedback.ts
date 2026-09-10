import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { feedbackKeys } from "#/lib/domain/query-keys"
import { apiGet, apiPost } from "#/lib/api-client"
import type { FeedbackType } from "#/lib/domain/feedback"

export type FeedbackItem = {
  id: string
  name: string
  message: string
  type: FeedbackType
  createdAt: string | Date
}

export function useRecentFeedback() {
  return useQuery({
    queryKey: feedbackKeys.public(),
    queryFn: () => apiGet<FeedbackItem[]>("/api/handlers/feedback/recent"),
  })
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; email: string; message: string; type: FeedbackType }) =>
      apiPost<FeedbackItem>("/api/handlers/feedback", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.public() })
    },
  })
}
