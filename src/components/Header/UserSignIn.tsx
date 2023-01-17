import { LogoGithubIcon } from "@primer/octicons-react";
import { signIn } from "next-auth/react";
import { Button } from "../Button";

export const UserSignIn = () => (
  <>
    <p className="mb-4 max-w-sm text-center">
      Share your Github profile with us!
    </p>

    <Button onClick={() => signIn("github", { callbackUrl: "/" })}>
      Sign in with <LogoGithubIcon />
    </Button>
  </>
);
