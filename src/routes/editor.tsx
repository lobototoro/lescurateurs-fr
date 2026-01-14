import { useState } from "react";
import HeaderMenu from "@/components/editor-components/headerMenu";
import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { authClient } from "lib/auth/auth-client";
import { authMiddleware } from "lib/auth/middleware";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/editor")({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  const [selectedPermission, setSelectedPermission] = useState("");
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
          <h1 className="text-4xl font-bold font-titles text-center w-full mt-4 mb-4">Les Curateurs: editor</h1>
          <div className="m-auto w-3/4">
            <Separator className="my-4" />
          </div>
          <HeaderMenu
            role={(session.user as any)?.role || ""}
            permissions={(session.user as any)?.permissions}
            setSelection={setSelectedPermission}
            selection={selectedPermission}
          />
          <div className="m-auto w-3/4">
            <Separator className="my-4" />
          </div>
          <div className="place-self-stretch">
            <Button onClick={logout}>Logout</Button>
          </div>
        </section>
      )}
    </div>
  );
}
