import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/_layout/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <h2 className="w-full text-center mt-7 mb-7">Welcome Curator!</h2>;
}
