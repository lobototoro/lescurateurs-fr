import { createFileRoute } from "@tanstack/react-router";

import { authClient } from "lib/auth/auth-client";
import { SignupForm } from "@/components/signup-form";

export const Route = createFileRoute("/editor/_layout/createuser")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();

  return (
    <section className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">{session && <SignupForm />}</div>
    </section>
  );
}
