import { createFileRoute } from "@tanstack/react-router";

import { authClient } from "lib/auth/auth-client";
import { SignupForm } from "@/components/signup-form";

export const Route = createFileRoute("/editor/_layout/createuser")({
  component: RouteComponent,
});

/*
 * Here we simply display the signup form
 * after which a mail is sent to the new user for email validation
 * and on valdiation success, another mail is sent to change the password
 * All powered by better-auth login-flow.
 */
function RouteComponent() {
  const { data: session } = authClient.useSession();

  return (
    <section className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">{session && <SignupForm />}</div>
    </section>
  );
}
