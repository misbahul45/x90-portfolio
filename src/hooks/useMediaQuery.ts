import { useEffect, useState } from "react"

export function useMediaQuery(query: string, serverValue = false): boolean {
  const [matches, setMatches] = useState(serverValue)

  useEffect(() => {
    const list = window.matchMedia(query)
    setMatches(list.matches)
    const onChange = (event: MediaQueryListEvent): void => setMatches(event.matches)
    list.addEventListener("change", onChange)
    return () => list.removeEventListener("change", onChange)
  }, [query])

  return matches
}
