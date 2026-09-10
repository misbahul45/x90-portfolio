import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/research")({
  component: ResearchLayout,
})

function ResearchLayout() {
  return <Outlet />
}
