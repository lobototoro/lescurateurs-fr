import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/editor/_layout/updatearticles')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/editor/_layout/updatearticles"!</div>
}
