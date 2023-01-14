import { LocationIcon, PeopleIcon } from "@primer/octicons-react";
import type { Profile } from "@prisma/client";
import Image from "next/image";

export const UserInfo = ({ profile, position }: UserInfoProps) => {
  return (
    <div className="flex gap-4">
      {/* photo & position */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        {profile.avatar && (
          <Image
            className="h-fit rounded-full"
            src={profile?.avatar}
            width="48"
            height="48"
            alt=""
          />
        )}
        <p className="text-sm font-semibold">{position}º</p>
      </div>
      {/* Content */}
      <div className="flex w-full flex-col gap-2">
        {/* Name & Login */}
        <div className="flex items-baseline gap-2">
          <a
            href={`https://github.com/${profile.github}`}
            target="_blank"
            className="text-xl font-semibold leading-4 text-gray-300 hover:underline"
            rel="noreferrer"
          >
            {profile.name ?? profile.github}
          </a>
          {profile.name && (
            <p className="text-base leading-4">{profile.github}</p>
          )}
        </div>
        {/* Bio & Infos */}
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:gap-6">
          {profile.bio && (
            <div className="">
              <p className="max-w-[45ch] text-sm">{profile.bio}</p>
            </div>
          )}

          {/* Infos */}
          <div className="flex w-52 flex-col gap-1 whitespace-nowrap">
            <Info icon={<PeopleIcon />}>
              <span className="text-gray-300">
                {transformFollowers(profile.followers)}
              </span>{" "}
              followers
            </Info>

            {profile.location && (
              <Info icon={<LocationIcon />}>{profile.location}</Info>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type UserInfoProps = {
  profile: Omit<Profile, "userId">;
  position: number;
};

const Info = ({
  icon,
  children,
}: {
  icon: JSX.Element;
  children: React.ReactNode;
}) => (
  <p className="flex items-center gap-1 text-xs">
    {icon}
    <span>{children}</span>
  </p>
);

function transformFollowers(followers: number) {
  if (followers < 1000) return followers;
  if (followers < 1000000) return `${(followers / 1000).toFixed(1)}k`;
  return `${(followers / 1000000).toFixed(1)}m`;
}
