import { LocationIcon, PeopleIcon } from "@primer/octicons-react";
import type { Profile } from "@prisma/client";
import Image from "next/image";

export const ProfileItem = ({ profile, position }: ProfileItemProps) => {
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
            className="text-xl font-semibold leading-6 text-gray-300 hover:underline"
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

            {profile.twitter && (
              <Info icon={<TwitterIcon />}>
                <a href={`https://twitter.com/${profile.twitter}`}>
                  {profile.twitter}
                </a>
              </Info>
            )}

            {profile.location && (
              <Info icon={<LocationIcon />}>{profile.location}</Info>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type ProfileItemProps = {
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

const TwitterIcon = () => (
  <svg
    className="h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 273.5 222.3"
    role="img"
  >
    <path
      d="M273.5 26.3a109.77 109.77 0 0 1-32.2 8.8 56.07 56.07 0 0 0 24.7-31 113.39 113.39 0 0 1-35.7 13.6 56.1 56.1 0 0 0-97 38.4 54 54 0 0 0 1.5 12.8A159.68 159.68 0 0 1 19.1 10.3a56.12 56.12 0 0 0 17.4 74.9 56.06 56.06 0 0 1-25.4-7v.7a56.11 56.11 0 0 0 45 55 55.65 55.65 0 0 1-14.8 2 62.39 62.39 0 0 1-10.6-1 56.24 56.24 0 0 0 52.4 39 112.87 112.87 0 0 1-69.7 24 119 119 0 0 1-13.4-.8 158.83 158.83 0 0 0 86 25.2c103.2 0 159.6-85.5 159.6-159.6 0-2.4-.1-4.9-.2-7.3a114.25 114.25 0 0 0 28.1-29.1"
      fill="currentColor"
    />
  </svg>
);
