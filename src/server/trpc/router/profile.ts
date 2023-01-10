import type { Profile } from "@prisma/client";
import type { Context } from "../context";
import { router, protectedProcedure, publicProcedure } from "../trpc";

export const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.profile.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

  getMany: publicProcedure.query(async ({ ctx }) => {
    try {
      const profiles = await ctx.prisma.profile.findMany({
        where: {
          published: true,
        },
        orderBy: { followers: "desc" },
      });

      const syncedProfiles = await fetchAndSyncProfiles(profiles);
      const updated = await updateSyncedProfiles(ctx, syncedProfiles);
      const result = combineAndSort(profiles, updated);

      return result;
    } catch (error) {
      throw new Error(`An error occurred`);
    }
  }),

  publish: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Check if the user has a profile stored
      const profile = await ctx.prisma.profile.findFirst({
        where: { userId: ctx.session?.user?.id },
      });

      let user = {} as UserResponse;

      // if not, create and return a new one
      if (!profile) {
        const token = await getGithubToken(ctx);
        user = await fetchGithubUser(token);
        return createProfile(ctx, user);
      }

      // sync the profile if it's older than 10 minutes
      if (hasMoreThanMinutes(profile.syncedAt, 10)) {
        const token = await getGithubToken(ctx);
        user = await fetchGithubUser(token);
      }

      return updateProfileSynced(ctx, user);
    } catch (error) {
      throw new Error("Error while publishing profile.");
    }
  }),

  unpublish: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.profile.update({
      data: { published: false },
      where: { userId: ctx.session?.user?.id },
    });
  }),
});

async function updateProfileSynced(ctx: Context, user: UserResponse) {
  return await ctx.prisma.profile.update({
    where: { userId: ctx.session?.user?.id },
    data: {
      published: true,
      syncedAt: new Date(),
      ...mapGithubUserToProfile(user),
    },
  });
}

async function createProfile(ctx: Context, user: UserResponse) {
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

async function fetchGithubUser(token: string) {
  const githubUser = await fetchGithubUserWithToken(token);
  if (!githubUser) {
    throw new Error("Fail to fetch user from github api");
  }
  return githubUser;
}

function mapGithubUserToProfile(user: UserResponse) {
  return {
    github: user.login,
    name: user.name,
    avatar: user.avatar_url,
    bio: user.bio,
    location: user.location,
    website: user.blog,
    twitter: user.twitter_username,
    followers: user.followers,
    hireable: user.hireable ?? false,
  };
}

export interface UserResponse {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  followers: number;
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

async function getGithubToken(ctx: Context) {
  const account = await ctx.prisma.account.findFirstOrThrow({
    where: { userId: ctx.session?.user?.id },
  });
  if (!account?.access_token) {
    throw new Error("No access token");
  }
  return account.access_token;
}

function hasMoreThanMinutes(date: Date, minutes = 10) {
  const lastUpdated = new Date(date).getTime();
  const now = new Date().getTime();
  const diff = now - lastUpdated;
  const diffSeconds = Math.floor(diff / 1000 / 60);
  return diffSeconds > minutes;
}

function isProfileOutdated(profile: Profile) {
  const MINUTES_IN_24_HOURS = 1440;
  return hasMoreThanMinutes(profile.syncedAt, MINUTES_IN_24_HOURS);
}

async function fetchAndSyncProfiles(profiles: Profile[]) {
  const profilesToSync = profiles.filter(isProfileOutdated);

  if (profilesToSync.length === 0) {
    return profiles;
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
async function updateSyncedProfiles(ctx: Context, syncedProfiles: Profile[]) {
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
function combineAndSort(profiles: Profile[], updated: Profile[]) {
  const combined = new Map<string, Profile>();
  for (const profile of [...profiles, ...updated]) {
    combined.set(profile.github, profile);
  }
  return [...combined.values()].sort((a, b) => b.followers - a.followers);
}
