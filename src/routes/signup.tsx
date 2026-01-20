import { SignupForm } from "@/components/signup-form";
import { createFileRoute } from "@tanstack/react-router";
import { authMiddleware } from "lib/auth/middleware";
import { authClient } from "lib/auth/auth-client";

export const Route = createFileRoute("/signup")({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">{session && <SignupForm />}</div>
    </div>
  );
}
