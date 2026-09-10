export type CategorySlug =
  | "llm"
  | "rag"
  | "agents"
  | "ml"
  | "dl"
  | "data"

export const CATEGORIES: ReadonlyArray<{ slug: CategorySlug; name: string; short: string }> = [
  { slug: "llm", name: "LLM", short: "Large language models" },
  { slug: "rag", name: "RAG", short: "Retrieval-augmented generation" },
  { slug: "agents", name: "Agents", short: "Tool-using autonomous systems" },
  { slug: "ml", name: "Machine Learning", short: "Classical ML techniques" },
  { slug: "dl", name: "Deep Learning", short: "Neural network architectures" },
  { slug: "data", name: "Data Intelligence", short: "Pipelines & analytics" },
] as const

export const CATEGORY_SLUGS: ReadonlyArray<CategorySlug> = CATEGORIES.map((category) => category.slug)

export function findCategory(slug: string): (typeof CATEGORIES)[number] | undefined {
  return CATEGORIES.find((category) => category.slug === slug)
}
