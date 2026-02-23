import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "lib/auth/auth-client";
import { useEffect, useState } from "react";

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
  const { token } = Route.useParams();

  useEffect(() => {
    if (token) {
      verifEmail(token).then((result) => {
        if (result === false) {
          setValidated(false);
        } else {
          setValidated(true);
        }
      });
    } else {
      console.error("No token provided for email verification.");
      setValidated(false);
    }
  }, [token]);

  return (
    <section>
      {validated && (
        <div>
          <h1>Validé !</h1>
          <Link to="/editor">Se connecter</Link>
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
