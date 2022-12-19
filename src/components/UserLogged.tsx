import type { User } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useShareProfile } from "./useShareProfile";

export const UserLogged = ({ user: { image, name } }: UserLoggedProps) => {
  const firstName = name?.split(" ")[0];

  const { handlePublish, isPublished, isLoading } = useShareProfile();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {image ? (
        <Image
          className="rounded-full"
          src={image}
          width="72"
          height="72"
          alt="User avatar"
        />
      ) : (
        `Hi, ${firstName}`
      )}
      <>
        <button
          onClick={handlePublish}
          className="rounded bg-slate-200 px-4 py-1 transition-colors hover:bg-slate-600 hover:text-white"
        >
          {isPublished ? "Unshare" : "Share"}
        </button>
        <button className="underline" onClick={() => signOut()}>
          Sign out
        </button>
      </>
    </div>
  );
};

type UserLoggedProps = {
  user: User;
};
