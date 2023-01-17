import type { User } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "../Button";
import { useShareProfile } from "./useShareProfile";

export const UserLogged = ({ user: { image, name } }: UserLoggedProps) => {
  const { handlePublish, isPublished, isLoading, profile } = useShareProfile();

  // Uses the first name if the user didn't share their profile yet
  // because the profile is only created after the user shares it
  // if the user unshares their profile, the profile is not deleted
  // it is just set to published: false
  const firstName = name?.split(" ")[0];
  const userName = profile?.github || firstName;

  return (
    <div className="flex flex-col items-center gap-2">
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
      <>
        <Button
          variant={isPublished ? "danger" : "default"}
          disabled={isLoading}
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
