import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  type TRPCContext,
  createTRPCRouter,
  privateProcedure,
} from "~/server/api/trpc";

const configurationNameSchema = z.string().trim().min(1);

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
        name: configurationNameSchema,
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
  changeName: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: configurationNameSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkOwnership(ctx, input.id);

      return ctx.prisma.configuration.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  changeBaseTheme: privateProcedure
    .input(
      z.object({
        id: z.string(),
        baseThemeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkOwnership(ctx, input.id);

      return ctx.prisma.configuration.update({
        where: {
          id: input.id,
        },
        data: {
          baseTheme: {
            connect: {
              id: input.baseThemeId,
            },
          },
        },
      });
    }),
});

async function checkOwnership(ctx: TRPCContext, configurationId: string) {
  const configuration = await ctx.prisma.configuration.findUnique({
    where: {
      id: configurationId,
    },
  });

  if (configuration?.createdById !== ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
}
