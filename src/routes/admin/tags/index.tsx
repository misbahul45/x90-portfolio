import { createFileRoute } from "@tanstack/react-router"
import { TaxonomyManager } from "#/components/admin/TaxonomyManager"
import {
  useAdminCreateTag,
  useAdminDeleteTag,
  useAdminUpdateTag,
  useTags,
} from "#/hooks/useTags"

export const Route = createFileRoute("/admin/tags/")({
  head: () => ({ meta: [{ title: "Tags — Admin" }] }),
  component: AdminTagsPage,
})

function AdminTagsPage() {
  const { data, isPending, isError } = useTags()
  const createTag = useAdminCreateTag()
  const updateTag = useAdminUpdateTag()
  const deleteTag = useAdminDeleteTag()

  return (
    <TaxonomyManager
      noun="tag"
      title="Tags"
      description="Cross-cutting labels attached to research articles."
      namePlaceholder="Retrieval"
      emptyHint="Create one to label articles across topics."
      items={data}
      isPending={isPending}
      isError={isError}
      isSaving={createTag.isPending || updateTag.isPending}
      isDeleting={deleteTag.isPending}
      onCreate={createTag.mutateAsync}
      onUpdate={updateTag.mutateAsync}
      onDelete={deleteTag.mutateAsync}
    />
  )
}
