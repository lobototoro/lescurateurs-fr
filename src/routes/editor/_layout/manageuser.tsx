import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/editor/_layout/manageuser')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/editor/_layout/manageuser"!</div>
}
