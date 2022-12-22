import { signIn, useSession } from "next-auth/react";
import { Button } from "../Button";
import { UserLogged } from "./UserLogged";
import { LogoGithubIcon } from "@primer/octicons-react";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="my-8 flex cursor-default flex-col items-center">
      <h1 className="mb-2 text-3xl font-semibold text-gray-300">Octodevs</h1>
      {session?.user ? (
        <UserLogged user={session.user} />
      ) : (
        <>
          <p className="mb-4 max-w-sm text-center text-[16px] leading-5">
            Share your Github profile with us!
          </p>

          <Button onClick={() => signIn("github", { callbackUrl: "/" })}>
            Sign in with <LogoGithubIcon />
          </Button>
        </>
      )}
    </header>
  );
};
