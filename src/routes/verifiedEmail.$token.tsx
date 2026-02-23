import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "lib/auth/auth-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const email = new URLSearchParams(window.location.search).get("email") as string;
  if (!email) {
    // Handle the error
    toast.error("email absent, vous ne pourrez pas recevoir le mail pour changer de password.");
  }
  const { token } = Route.useParams();

  useEffect(() => {
    if (token) {
      verifEmail(token).then(async (result) => {
        if (result === false) {
          setValidated(false);
        } else {
          setValidated(true);
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
    <section>
      {validated && (
        <div>
          <h1>Validé !</h1>
          <p>Vous allez recevoir un mail pour changer de mot de passe</p>
        </div>
      )}
      {!validated && (
        <div>
          <h1>Vous n'existez pas.</h1>
        </div>
      )}
    </section>
  );
}
