export const USER_ROLE = {
  READER: "READER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
} as const

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const USER_ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: "READER", label: "Reader" },
  { value: "EDITOR", label: "Editor" },
  { value: "ADMIN", label: "Admin" },
]

export function isAdminRole(role: UserRole | undefined | null): boolean {
  return role === "ADMIN"
}

export function canEditArticles(role: UserRole | undefined | null): boolean {
  return role === "ADMIN" || role === "EDITOR"
}
