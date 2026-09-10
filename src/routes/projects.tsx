import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/projects")({
  component: ProjectsLayout,
})

function ProjectsLayout() {
  return <Outlet />
}
