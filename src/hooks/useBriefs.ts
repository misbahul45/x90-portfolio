import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { briefKeys } from "#/lib/domain/query-keys"
import { apiGet, apiPatch, apiPost, apiDelete } from "#/lib/api-client"
import type { BriefService, BriefStatus } from "#/lib/schemas/brief"

export type BriefItem = {
  id: string
  name: string
  email: string
  company: string | null
  whatsapp: string | null
  service: BriefService
  budget: string | null
  timeline: string | null
  message: string
  documentUrl: string | null
  status: BriefStatus
  createdAt: string | Date
}

export function useSubmitBrief() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      name: string
      email: string
      company?: string
      whatsapp?: string
      service: BriefService
      budget?: string
      timeline?: string
      message: string
      documentUrl?: string
      documentName?: string
      documentMimeType?: string
    }) => apiPost<BriefItem>("/api/handlers/brief", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: briefKeys.all })
    },
  })
}

export type BriefAttachmentUpload = {
  url: string
  name: string
  mimeType: string
}

type UploadResponse =
  | { ok: true; data: { url: string } }
  | { ok: false; error: { message: string } }

export function useUploadBriefAttachment() {
  return useMutation({
    mutationFn: async (file: File): Promise<BriefAttachmentUpload> => {
      const form = new FormData()
      form.append("file", file, file.name)
      form.append("purpose", "brief-attachment")
      const response = await fetch("/api/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      })
      const payload = (await response.json()) as UploadResponse
      if (!payload.ok) throw new Error(payload.error.message)
      return { url: payload.data.url, name: file.name, mimeType: file.type }
    },
  })
}

export function useAdminBriefs(filters: { status?: BriefStatus; service?: BriefService } = {}) {
  return useQuery({
    queryKey: briefKeys.adminListFiltered(filters),
    queryFn: () => apiGet<BriefItem[]>("/api/handlers/admin/briefs", filters),
  })
}

export function useUpdateBriefStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string; status: BriefStatus }) =>
      apiPatch<BriefItem>(`/api/handlers/admin/briefs/${input.id}`, { status: input.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: briefKeys.all })
    },
  })
}

export function useDeleteBrief() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/api/handlers/admin/briefs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: briefKeys.all })
    },
  })
}
