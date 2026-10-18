import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { articleKeys, experimentKeys } from "#/lib/domain/query-keys"
import { apiDelete, apiGet, apiPatch, apiPost } from "#/lib/api-client"
import type {
  ExperimentMethod,
  ExperimentStatus,
  ScalarValue,
} from "#/lib/domain/experiments"
import type {
  ExperimentCreateInput,
  ExperimentUpdateInput,
} from "#/lib/schemas/experiment"

export type ExperimentItem = {
  id: string
  title: string
  slug: string
  summary: string
  baseModel: string
  method: ExperimentMethod
  datasetName: string | null
  datasetSize: number | null
  hyperparams: Record<string, ScalarValue>
  metrics: Record<string, number>
  status: ExperimentStatus
  stage: number
  notes: string
  articleId: string | null
  projectId: string | null
  createdAt: string
  updatedAt: string
  article: { id: string; slug: string; title: string; status: string } | null
  project: { id: string; slug: string; title: string } | null
}

export function useAdminExperiments(filters: { status?: ExperimentStatus } = {}) {
  return useQuery({
    queryKey: experimentKeys.list(filters),
    queryFn: () => apiGet<ExperimentItem[]>("/api/handlers/admin/experiments", filters),
  })
}

export function useAdminExperiment(id: string) {
  return useQuery({
    queryKey: experimentKeys.detail(id),
    queryFn: () => apiGet<ExperimentItem>(`/api/handlers/admin/experiments/${id}`),
    enabled: id.length > 0,
  })
}

export function useAdminCreateExperiment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ExperimentCreateInput) =>
      apiPost<ExperimentItem>("/api/handlers/admin/experiments", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experimentKeys.all })
    },
  })
}

export function useAdminUpdateExperiment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ExperimentUpdateInput) =>
      apiPatch<ExperimentItem>(`/api/handlers/admin/experiments/${input.id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experimentKeys.all })
    },
  })
}

export function useAdminDeleteExperiment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/handlers/admin/experiments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experimentKeys.all })
    },
  })
}

export function useAdminDraftArticleFromExperiment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<ExperimentItem>(`/api/handlers/admin/experiments/${id}/draft-article`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experimentKeys.all })
      queryClient.invalidateQueries({ queryKey: articleKeys.all })
    },
  })
}
