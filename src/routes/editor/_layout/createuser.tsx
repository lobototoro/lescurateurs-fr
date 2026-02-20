import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/editor/_layout/createuser')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/editor/_layout/createuser"!</div>
}
