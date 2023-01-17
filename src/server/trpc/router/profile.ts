import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import z from "zod";

export const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.profile.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });
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
