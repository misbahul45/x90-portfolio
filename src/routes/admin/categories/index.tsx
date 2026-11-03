import { createFileRoute } from "@tanstack/react-router"
import { TaxonomyManager } from "#/components/admin/TaxonomyManager"
import {
  useAdminCreateCategory,
  useAdminDeleteCategory,
  useAdminUpdateCategory,
  useCategories,
} from "#/hooks/useCategories"

export const Route = createFileRoute("/admin/categories/")({
  head: () => ({ meta: [{ title: "Categories — Admin" }] }),
  component: AdminCategoriesPage,
})

function AdminCategoriesPage() {
  const { data, isPending, isError } = useCategories()
  const createCategory = useAdminCreateCategory()
  const updateCategory = useAdminUpdateCategory()
  const deleteCategory = useAdminDeleteCategory()

  return (
    <TaxonomyManager
      noun="category"
      title="Categories"
      description="Group research articles and projects under shared labels."
      namePlaceholder="Large language models"
      emptyHint="Create one to group articles and projects."
      items={data}
      isPending={isPending}
      isError={isError}
      isSaving={createCategory.isPending || updateCategory.isPending}
      isDeleting={deleteCategory.isPending}
      onCreate={createCategory.mutateAsync}
      onUpdate={updateCategory.mutateAsync}
      onDelete={deleteCategory.mutateAsync}
    />
  )
}
