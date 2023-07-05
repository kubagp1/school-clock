import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const configurationRouter = createTRPCRouter({
  getAll: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.configuration.findMany({
      where: {
        createdById: {
          equals: ctx.auth.userId,
        },
      },
      include: {
        baseTheme: true,
        instances: true,
        rules: true,
      },
    });
  }),
  getById: privateProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const configuration = await ctx.prisma.configuration.findUnique({
      where: {
        id: input,
      },
      include: {
        baseTheme: true,
        instances: true,
        rules: true,
      },
    });

    if (configuration?.createdById !== ctx.auth.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    return configuration;
  }),
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        baseThemeId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.configuration.create({
        data: {
          name: input.name,
          baseTheme: {
            connect: {
              id: input.baseThemeId,
            },
          },
          createdById: ctx.auth.userId,
        },
      });
    }),
});
