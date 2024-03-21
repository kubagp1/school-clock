import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const newsTickerRouter = createTRPCRouter({
  getAll: privateProcedure.input(z.string().min(1)).query(({ ctx, input }) => {
    return ctx.prisma.newsTicker.findMany({
      where: {
        configuration: {
          id: input,
          createdById: ctx.auth.userId,
        },
      },
      include: {
        rule: true,
        theme: true,
      },
    });
  }),
  create: privateProcedure
    .input(
      z.object({
        configurationId: z.string().min(1),
        text: z.string().min(1),
        loop: z.number().int().min(0),
        speed: z.number(),
        forceHiddenFalse: z.boolean(),
        startAt: z.date(),
        endAt: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (
        0 ==
        (await ctx.prisma.configuration.count({
          where: {
            id: input.configurationId,
            createdById: ctx.auth.userId,
          },
        }))
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      // const themeQuery =
    }),
});
