import { signIn, useSession } from "next-auth/react";
import { UserLogged } from "./UserLogged";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="my-8 flex flex-col items-center">
      <h1 className="mb-4 text-4xl">Octodevs</h1>
      {session?.user ? (
        <UserLogged user={session.user} />
      ) : (
        <button
          className="rounded bg-slate-200 px-4 py-1 transition-colors hover:bg-slate-600 hover:text-white"
          onClick={() => signIn("github", { callbackUrl: "/" })}
        >
          Sign in with Github
        </button>
      )}
    </header>
  );
};
