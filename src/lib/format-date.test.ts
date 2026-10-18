import { describe, expect, it } from "vitest"
import { formatFullDate, formatMonthYear } from "./format-date"

describe("format-date", () => {
  it("formats month and year in UTC", () => {
    expect(formatMonthYear("2026-03-31T23:30:00Z")).toBe("March 2026")
    expect(formatMonthYear(new Date("2026-04-01T00:00:00Z"))).toBe("April 2026")
  })

  it("formats a full date in UTC", () => {
    expect(formatFullDate("2026-10-17T08:00:00Z")).toBe("October 17, 2026")
  })

  it("returns an empty string for missing or invalid input", () => {
    expect(formatMonthYear(null)).toBe("")
    expect(formatMonthYear(undefined)).toBe("")
    expect(formatMonthYear("not-a-date")).toBe("")
    expect(formatFullDate("")).toBe("")
  })
})
