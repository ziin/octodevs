import { router, protectedProcedure, publicProcedure } from "../../trpc";
import z from "zod";
import * as u from "./utils";
import { TRPCError } from "@trpc/server";

export const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.profile.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

  getMany: publicProcedure
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
      let profile = await u.findAndSyncProfile(ctx);
      if (!profile) {
        const token = await u.getGithubToken(ctx);
        const user = await u.fetchGithubUser(token);
        profile = await u.createProfile(ctx, user);
      }
      return profile;
    } catch (error) {
      throw new Error("Error while publishing profile");
    }
  }),

  unpublish: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.profile.update({
      data: { published: false },
      where: { userId: ctx.session?.user?.id },
    });
  }),
});
