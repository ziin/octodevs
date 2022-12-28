import { signIn, useSession } from "next-auth/react";
import { Button } from "../Button";
import { UserLogged } from "./UserLogged";
import { LogoGithubIcon } from "@primer/octicons-react";
import type { PropsWithChildren } from "react";

export const Header = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <HeaderLayout>
        <p>Loading...</p>
      </HeaderLayout>
    );
  }

  return (
    <HeaderLayout>
      {session?.user ? (
        <UserLogged user={session.user} />
      ) : (
        <>
          <p className="mb-4 max-w-sm text-center">
            Share your Github profile with us!
          </p>

          <Button onClick={() => signIn("github", { callbackUrl: "/" })}>
            Sign in with <LogoGithubIcon />
          </Button>
        </>
      )}
    </HeaderLayout>
  );
};

const HeaderLayout = ({ children }: PropsWithChildren) => (
  <header className="my-8 flex cursor-default flex-col items-center">
    <h1 className="mb-2 text-3xl font-semibold text-gray-300">Octodevs</h1>
    {children}
  </header>
);
