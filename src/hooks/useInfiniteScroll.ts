import { useEffect, useRef } from "react"

type UseInfiniteScrollOptions = {
  enabled: boolean
  loading: boolean
  hasMore: boolean | undefined
  onLoadMore: () => void
  rootMargin?: string
}

export function useInfiniteScroll({
  enabled,
  loading,
  hasMore,
  onLoadMore,
  rootMargin = "200px 0px",
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    if (!enabled || !hasMore) return
    const node = sentinelRef.current
    if (!node) return
    if (typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !loading) {
          onLoadMoreRef.current()
        }
      },
      { rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled, hasMore, loading, rootMargin])

  return sentinelRef
}
