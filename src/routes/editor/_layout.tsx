import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

import HeaderMenu from "@/components/editor-components/headerMenu";
// import { Button } from "@/components/ui/button";

import { authClient } from "lib/auth/auth-client";
import { authMiddleware } from "lib/auth/middleware";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/editor/_layout")({
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
    <div className="w-3/4 m-auto">
      {session && (
        <section className="w-full h-full m-auto">
          <h1 className="text-4xl font-bold font-titles text-center w-full mt-4 mb-4">Les Curateurs: editor</h1>
          <div className="m-auto w-3/4">
            <Separator className="my-4" />
          </div>
          <HeaderMenu role={(session.user as any)?.role || ""} permissions={(session.user as any)?.permissions} logoutAction={logout} />
          <div className="m-auto w-3/4">
            <Separator className="my-4" />
          </div>
          <Outlet />
        </section>
      )}
    </div>
  );
}
