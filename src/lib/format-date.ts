const MONTH_YEAR = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

const FULL_DATE = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatMonthYear(value: Date | string | null | undefined): string {
  const date = toDate(value)
  return date ? MONTH_YEAR.format(date) : ""
}

export function formatFullDate(value: Date | string | null | undefined): string {
  const date = toDate(value)
  return date ? FULL_DATE.format(date) : ""
}
