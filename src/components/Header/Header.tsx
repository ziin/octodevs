import { useSession } from "next-auth/react";
import type { PropsWithChildren } from "react";
import { UserInfo } from "./UserInfo";
import { UserSignIn } from "./UserSignIn";

export const Header = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Wrapper>
        <p>Loading...</p>
      </Wrapper>
    );
  }

  if (!session?.user) {
    return (
      <Wrapper>
        <UserSignIn />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <UserInfo user={session.user} />
    </Wrapper>
  );
};

const Wrapper = ({ children }: PropsWithChildren) => (
  <header className="mt-8 mb-4 flex cursor-default flex-col items-center">
    <h1 className="mb-2 text-3xl font-semibold text-gray-300">Octodevs</h1>
    {children}
  </header>
);
