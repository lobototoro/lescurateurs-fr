import HeaderMenu from "@/components/editor-components/headerMenu";
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
    <div className="flex flex-col items-center justify-center w-full">
      {session && (
        <section className="w-full h-full m-auto">
          <HeaderMenu role={(session.user as any)?.role || ""} permissions={(session.user as any)?.permissions} setSelection={() => {}} selection="" />
          <div className="place-self-stretch">
            <Button onClick={logout}>Logout</Button>
          </div>
        </section>
      )}
    </div>
  );
}
