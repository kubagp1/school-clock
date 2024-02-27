import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { conditionSchema } from "~/utils/rules";
import { TRPCError } from "@trpc/server";

export const ruleRouter = createTRPCRouter({
  getAll: privateProcedure.input(z.string().min(1)).query(({ ctx, input }) => {
    return ctx.prisma.rule.findMany({
      where: {
        configuration: {
          id: input,
          createdById: ctx.auth.userId,
        },
      },
    });
  }),
  getById: privateProcedure.input(z.string().min(1)).query(({ ctx, input }) => {
    return ctx.prisma.rule.findUnique({
      where: {
        id: input,
        configuration: {
          createdById: ctx.auth.userId,
        },
      },
    });
  }),
  create: privateProcedure
    .input(
      z.object({
        configurationId: z.string().min(1),
        name: z.string().trim().min(1),
        themeId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const configurationCount = await ctx.prisma.configuration.count({
        where: {
          id: input.configurationId,
          createdById: ctx.auth.userId,
        },
      });

      if (configurationCount === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const largestIndex = await ctx.prisma.rule.findFirst({
        select: {
          index: true,
        },
        where: {
          configuration: {
            id: input.configurationId,
            createdById: ctx.auth.userId,
          },
        },
        orderBy: {
          index: "desc",
        },
      });

      return ctx.prisma.rule.create({
        data: {
          name: input.name,
          configuration: {
            connect: {
              id: input.configurationId,
            },
          },
          theme: {
            connect: {
              id: input.themeId,
            },
          },
          index: largestIndex ? largestIndex.index + 1 : 0,
        },
      });
    }),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1),
        enabled: z.boolean(),
        themeId: z.string().min(1),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.rule.update({
        where: {
          id: input.id,
          configuration: {
            createdById: ctx.auth.userId,
          },
        },
        data: {
          name: input.name,
          enabled: input.enabled,
          theme: {
            connect: {
              id: input.themeId,
            },
          },
        },
      });
    }),
  delete: privateProcedure.input(z.string().min(1)).query(({ ctx, input }) => {
    return ctx.prisma.rule.delete({
      where: {
        id: input,
        configuration: {
          createdById: ctx.auth.userId,
        },
      },
    });
  }),
});
