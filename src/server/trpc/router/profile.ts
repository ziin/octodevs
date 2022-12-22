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
    return await ctx.prisma.profile.findMany({
      where: { published: true },
      orderBy: { followers: "desc" },
    });
  }),

  publish: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // check if the user has a profile stored
      const profile = await ctx.prisma.profile.findFirst({
        where: {
          userId: ctx.session?.user?.id,
        },
      });

      if (profile) {
        let user = {} as UserResponse;

        if (hasMoreThanMinutes(profile.syncedAt, 10)) {
          const token = await getGithubToken(ctx);
          const githubUser = await getUserFromGithub(token);
          if (!githubUser) {
            throw new Error("Fail to fetch user from github api");
          }
          user = githubUser;
        }

        await ctx.prisma.profile.update({
          where: {
            userId: ctx.session?.user?.id,
          },
          data: {
            published: true,
            syncedAt: new Date(),
            ...mapGithubUserToProfile(user),
          },
        });

        return profile;
      }

      // if the profile doesn't exist, create it
      if (!profile) {
        const token = await getGithubToken(ctx);
        const user = await getUserFromGithub(token);

        if (!user) {
          throw new Error("Fail to fetch user from github api");
        }

        const newProfile = await ctx.prisma.profile.create({
          data: {
            userId: ctx.session?.user?.id,
            published: true,
            ...mapGithubUserToProfile(user),
          },
        });

        return newProfile;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }),

  unpublish: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.profile.update({
      data: { published: false },
      where: { userId: ctx.session?.user?.id },
    });
  }),
});

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

async function getUserFromGithub(token: string): Promise<UserResponse | null> {
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
