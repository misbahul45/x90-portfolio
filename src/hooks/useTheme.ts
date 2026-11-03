import { useCallback, useSyncExternalStore } from "react"
import {
  THEME_COLORS,
  THEME_STORAGE_KEY,
  parsePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "#/lib/theme"

const DARK_QUERY = "(prefers-color-scheme: dark)"
const SERVER_SNAPSHOT = "system:light"

const listeners = new Set<() => void>()
let memoryPreference: ThemePreference | null = null

function readPreference(): ThemePreference {
  try {
    return parsePreference(window.localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return memoryPreference ?? "system"
  }
}

function persistPreference(preference: ThemePreference): void {
  memoryPreference = preference
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    return
  }
}

function systemPrefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches
}

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[resolved])
}

function notify(): void {
  listeners.forEach((listener) => listener())
}

function getSnapshot(): string {
  const preference = readPreference()
  return `${preference}:${resolveTheme(preference, systemPrefersDark())}`
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY)
  const onSystemChange = (): void => {
    applyTheme(resolveTheme(readPreference(), media.matches))
    onChange()
  }
  const onStorage = (event: StorageEvent): void => {
    if (event.key !== THEME_STORAGE_KEY) return
    applyTheme(resolveTheme(readPreference(), media.matches))
    onChange()
  }
  listeners.add(onChange)
  media.addEventListener("change", onSystemChange)
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    media.removeEventListener("change", onSystemChange)
    window.removeEventListener("storage", onStorage)
  }
}

export function useTheme(): {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
} {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT)
  const [preference, resolvedTheme] = snapshot.split(":") as [ThemePreference, ResolvedTheme]

  const setPreference = useCallback((next: ThemePreference): void => {
    persistPreference(next)
    applyTheme(resolveTheme(next, systemPrefersDark()))
    notify()
  }, [])

  return { preference, resolvedTheme, setPreference }
}
