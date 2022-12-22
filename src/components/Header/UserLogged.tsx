import type { User } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "../Button";
import { useShareProfile } from "./useShareProfile";

export const UserLogged = ({ user: { image, name } }: UserLoggedProps) => {
  const firstName = name?.split(" ")[0];

  const { handlePublish, isPublished, isLoading, profile } = useShareProfile();

  const userName = profile?.github || firstName;

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-center">
        {image && (
          <Image
            className="rounded-full"
            src={image}
            width="64"
            height="64"
            alt="User avatar"
          />
        )}
        <span className="text-[20px] font-semibold">{userName}</span>
      </p>
      <>
        <Button
          variant={isPublished ? "danger" : "default"}
          onClick={handlePublish}
        >
          {isPublished ? "Unshare" : "Share"}
        </Button>
        <Button variant="invisible" onClick={() => signOut()}>
          Sign out
        </Button>
      </>
    </div>
  );
};

type UserLoggedProps = {
  user: User;
};
