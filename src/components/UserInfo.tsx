import type { Profile } from "@prisma/client";
import Image from "next/image";

export const UserInfo = ({ profile }: UserInfoProps) => {
  return (
    <div className="flex gap-4">
      {profile.avatar && (
        <Image
          className="h-fit rounded-full"
          src={profile?.avatar}
          width="64"
          height="64"
          alt=""
        />
      )}
      <div className="grid w-full grid-cols-2">
        <div>
          <h1>{profile.name}</h1>
          <p>{profile.github}</p>
          <p>{profile.bio}</p>
        </div>
        <div>
          <p>Followers: {profile.followers}</p>
          <p>Location: {profile.location}</p>
          <p>Site: {profile.website}</p>
          <p>Twitter: {profile.twitter}</p>
          <p>Open to Work: {profile.hireable ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  );
};

type UserInfoProps = {
  profile: Omit<Profile, "userId">;
};
