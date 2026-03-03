import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "lib/auth/auth-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/verifiedEmail/$token")({
  component: RouteComponent,
});

async function verifEmail(tok: string): Promise<any | boolean> {
  try {
    const verification = await authClient.verifyEmail({
      query: {
        token: tok, // Pass the token here
      },
    });

    return verification;
  } catch (error) {
    console.error("Email verification failed:", error);

    return false;
  }
}

function RouteComponent() {
  const [validated, setValidated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const { token } = Route.useParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const queryEmail = new URLSearchParams(window.location.search).get("email");
    setEmail(queryEmail);
    if (!queryEmail) {
      toast.error("email absent, vous ne pourrez pas recevoir le mail pour changer de password.");
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifEmail(token).then(async (result) => {
        if (result === false) {
          setValidated(false);
        } else {
          setValidated(true);
          if (!email) return;
          const { error } = await authClient.requestPasswordReset({
            email, // required
            redirectTo: "/",
          });

          if (error) {
            toast.error("Erreur à l'envoi du mail de reset de password.");
          }
        }
      });
    } else {
      console.error("No token provided for email verification.");
      setValidated(false);
    }
  }, [token, email]);

  return (
    <section className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {validated && (
          <Card>
            <CardHeader>
              <CardTitle>Votre email est validé !</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Vous allez recevoir un mail pour changer de mot de passe</p>
              <p>Vous pouvez fermer cette fenêtre.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
