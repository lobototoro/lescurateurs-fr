import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "lib/auth/auth-client";
import { authMiddleware } from "lib/auth/middleware";

export const Route = createFileRoute("/editor")({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const logout = async () =>
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: "/",
            replace: true,
          });
        },
      },
    });

  return (
    <div>
      Hello "Curateur"! <br />
      {session && <Button onClick={logout}>Logout</Button>}
    </div>
  );
}
