import { describe, expect, it } from "vitest"
import {
  THEME_COLORS,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  parsePreference,
  resolveTheme,
} from "#/lib/theme"

type FakeEnv = {
  stored: string | null
  systemDark: boolean
  throwOnStorage?: boolean
}

function runInitScript({ stored, systemDark, throwOnStorage }: FakeEnv) {
  const classes = new Set<string>()
  const meta = { content: "", setAttribute(_name: string, value: string) { this.content = value } }
  const root = {
    classList: {
      toggle(name: string, force: boolean) {
        if (force) classes.add(name)
        else classes.delete(name)
      },
    },
    style: { colorScheme: "" },
  }
  const localStorage = {
    getItem(key: string) {
      if (throwOnStorage) throw new Error("blocked")
      return key === THEME_STORAGE_KEY ? stored : null
    },
  }
  const document = {
    documentElement: root,
    querySelector: () => meta,
  }
  const window = { matchMedia: () => ({ matches: systemDark }) }
  new Function("document", "localStorage", "window", THEME_INIT_SCRIPT)(document, localStorage, window)
  return { dark: classes.has("dark"), colorScheme: root.style.colorScheme, themeColor: meta.content }
}

describe("parsePreference", () => {
  it("accepts explicit light and dark", () => {
    expect(parsePreference("light")).toBe("light")
    expect(parsePreference("dark")).toBe("dark")
  })

  it("falls back to system for anything else", () => {
    expect(parsePreference(null)).toBe("system")
    expect(parsePreference(undefined)).toBe("system")
    expect(parsePreference("sepia")).toBe("system")
  })
})

describe("resolveTheme", () => {
  it("follows the system only for the system preference", () => {
    expect(resolveTheme("system", true)).toBe("dark")
    expect(resolveTheme("system", false)).toBe("light")
    expect(resolveTheme("light", true)).toBe("light")
    expect(resolveTheme("dark", false)).toBe("dark")
  })
})

describe("THEME_INIT_SCRIPT", () => {
  it("applies the stored dark preference regardless of the system", () => {
    expect(runInitScript({ stored: "dark", systemDark: false })).toEqual({
      dark: true,
      colorScheme: "dark",
      themeColor: THEME_COLORS.dark,
    })
  })

  it("applies the stored light preference regardless of the system", () => {
    expect(runInitScript({ stored: "light", systemDark: true })).toEqual({
      dark: false,
      colorScheme: "light",
      themeColor: THEME_COLORS.light,
    })
  })

  it("follows the system when nothing is stored", () => {
    expect(runInitScript({ stored: null, systemDark: true }).dark).toBe(true)
    expect(runInitScript({ stored: null, systemDark: false }).dark).toBe(false)
  })

  it("still follows the system when storage is blocked", () => {
    expect(runInitScript({ stored: null, systemDark: true, throwOnStorage: true }).dark).toBe(true)
  })
})
