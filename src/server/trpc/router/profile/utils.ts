import type { Profile } from "@prisma/client";
import type { UserResponse } from "../../../../types/github";
import { mapGithubUserToProfile } from "../../../../utils/functions";
import type { Context } from "../../context";

export async function findAndSyncProfile(
  ctx: Context,
): Promise<Profile | undefined> {
  const profile = await ctx.prisma.profile.findFirst({
    where: { userId: ctx.session?.user?.id },
  });

  // no profile
  if (!profile) return;

  // profile is updated
  if (isProfileUpdated(profile, 10)) return profile;

  // when profile is outdated, we sync it with github
  const token = await getGithubToken(ctx);
  const user = await fetchGithubUser(token);
  const profileUpdated = await updateProfile(ctx, {
    published: true,
    syncedAt: new Date(),
    ...mapGithubUserToProfile(user),
  });

  return profileUpdated;
}

async function updateProfile(ctx: Context, data: Partial<Profile>) {
  return await ctx.prisma.profile.update({
    where: { userId: ctx.session?.user?.id },
    data,
  });
}

export async function createProfile(ctx: Context, user: UserResponse) {
  return await ctx.prisma.profile.create({
    data: {
      user: {
        connect: { id: ctx.session?.user?.id },
      },
      published: true,
      ...mapGithubUserToProfile(user),
    },
  });
}

export async function fetchGithubUser(token: string) {
  const githubUser = await fetchGithubUserWithToken(token);
  if (!githubUser) {
    throw new Error("Fail to fetch user from github api");
  }
  return githubUser;
}

async function fetchGithubUserWithToken(
  token: string,
): Promise<UserResponse | null> {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function fetchGithubUserWithUsername(
  username: string,
): Promise<UserResponse | null> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function getGithubToken(ctx: Context) {
  const account = await ctx.prisma.account.findFirstOrThrow({
    where: { userId: ctx.session?.user?.id },
  });
  if (!account?.access_token) {
    throw new Error("No access token");
  }
  return account.access_token;
}

export function isOutdated(date: Date, thresholdInMinutes = 10) {
  const lastUpdated = new Date(date).getTime();
  const now = Date.now();
  const timeDifferenceInMinutes = (now - lastUpdated) / 1000 / 60;
  return timeDifferenceInMinutes > thresholdInMinutes;
}

/**
 * The profile is outdated
 */
function isProfileUpdated(profile: Profile, thresholdInMinutes = 10) {
  return !isOutdated(profile.syncedAt, thresholdInMinutes);
}

/**
 * Sync profiles older than 24h with github
 */
export async function syncProfilesWithGithub(profiles: Profile[]) {
  const profilesToSync = profiles.filter(isProfileUpdated, 24 * 60); // 24h

  if (profilesToSync.length === 0) {
    return [];
  }

  const users = await Promise.all(
    profilesToSync.map(async (profile) => {
      const user = await fetchGithubUserWithUsername(profile.github);
      return user;
    }),
  );

  const syncedProfiles = users.map((user) => {
    return {
      ...mapGithubUserToProfile(user as UserResponse),
      syncedAt: new Date(),
    };
  });

  return syncedProfiles as Profile[];
}

/**
 * Update synced profiles on db
 **/
export async function updateSyncedProfiles(
  ctx: Context,
  syncedProfiles: Profile[],
) {
  if (syncedProfiles.length === 0) {
    return [];
  }

  const updated = await Promise.all(
    syncedProfiles.map(async (profile) =>
      ctx.prisma.profile.update({
        where: { github: profile.github },
        data: profile,
      }),
    ),
  );
  return updated;
}

/**
 * Combine profiles and sort by followers
 */
export function combineAndSort(profiles: Profile[], updated: Profile[]) {
  const combined = new Map<string, Profile>();
  for (const profile of [...profiles, ...updated]) {
    combined.set(profile.github, profile);
  }
  return [...combined.values()].sort((a, b) => b.followers - a.followers);
}
