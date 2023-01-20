import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import z from "zod";
import type { UserResponse } from "../../../types/github";
import { mapGithubUserToProfile } from "../../../utils/functions";
import type { Context } from "../context";

export const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getMe(ctx);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error getting profile",
      });
    }
  }),

  getPaginated: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).nullish(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const limit = input.limit ?? 10;
        const { cursor } = input;

        const profiles = await ctx.prisma.profile.findMany({
          take: limit + 1, // get an extra item at the end which we'll use as next cursor
          where: {
            published: true,
          },
          orderBy: { followers: "desc" },
          cursor: cursor ? { github: cursor } : undefined,
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (profiles.length > limit) {
          const nextProfile = profiles.pop();
          nextCursor = nextProfile!.github;
        }
        return {
          profiles,
          nextCursor,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error getting profiles",
        });
      }
    }),

  publish: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // check if profiles exists
      const profile = await getMe(ctx);

      // if not, fetch on github
      if (!profile) {
        const user = await fetchMyGithubProfile(ctx);

        await ctx.prisma.profile.create({
          data: {
            userId: ctx.session.user.id,
            published: true,
            ...mapGithubUserToProfile(user),
          },
        });
      }

      // update profile with published true
      await ctx.prisma.profile.update({
        data: { published: true },
        where: { userId: ctx.session?.user?.id },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error publishing profile",
      });
    }
  }),

  unpublish: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await ctx.prisma.profile.update({
        data: { published: false },
        where: { userId: ctx.session?.user?.id },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error unpublishing profile",
      });
    }
  }),
});

async function fetchMyGithubProfile(ctx: Context) {
  const token = await getGithubToken(ctx);
  const user = await fetchGithubUserWithToken(token);
  if (!user) throw new Error("Error fetching github user");
  return user;
}

async function getGithubToken(ctx: Context) {
  const { access_token: token } = await ctx.prisma.account.findFirstOrThrow({
    where: {
      userId: ctx.session?.user?.id,
    },
  });
  if (!token) throw new Error("Token not found");
  return token;
}

async function getMe(ctx: Context) {
  return await ctx.prisma.profile.findFirst({
    where: {
      userId: ctx.session?.user?.id,
    },
  });
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
