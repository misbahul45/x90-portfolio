import { describe, expect, it } from "vitest"
import { articleUpdateSchema } from "./article"
import { projectUpdateSchema } from "./project"
import { teamMemberUpdateSchema } from "./team-member"

describe("partial update schemas", () => {
  it("does not inject defaults into article updates", () => {
    expect(articleUpdateSchema.parse({ id: "a1", title: "New title here" })).toEqual({
      id: "a1",
      title: "New title here",
    })
  })

  it("does not inject defaults into project updates", () => {
    expect(projectUpdateSchema.parse({ id: "p1", featured: true })).toEqual({ id: "p1", featured: true })
  })

  it("does not inject defaults into team member updates", () => {
    expect(teamMemberUpdateSchema.parse({ id: "t1", role: "Engineer" })).toEqual({ id: "t1", role: "Engineer" })
  })

  it("still validates provided values", () => {
    expect(articleUpdateSchema.safeParse({ id: "a1", status: "NOT_A_STATUS" }).success).toBe(false)
  })
})
