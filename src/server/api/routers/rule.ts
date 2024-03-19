import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { conditionSchema } from "~/utils/conditions";
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
      include: {
        configuration: true,
        theme: true,
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

      const themeCount = await ctx.prisma.theme.count({
        where: {
          id: input.themeId,
          createdById: ctx.auth.userId,
        },
      });

      if (themeCount === 0) {
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
    .mutation(async ({ ctx, input }) => {
      const themeCount = await ctx.prisma.theme.count({
        where: {
          id: input.themeId,
          createdById: ctx.auth.userId,
        },
      });

      if (themeCount === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

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
  updateOrder: privateProcedure
    .input(
      z.array(
        z.object({
          id: z.string().min(1),
          index: z.number().min(0),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      if (new Set(input.map((x) => x.id)).size !== input.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Duplicate rule IDs provided",
        });
      }

      const currentRules = await ctx.prisma.rule.findMany({
        where: {
          id: {
            in: input.map((x) => x.id),
          },
          configuration: {
            createdById: ctx.auth.userId,
          },
        },
      });

      if (currentRules.length !== input.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Invalid rule IDs, or indexes for all rules in this configuration were not provided, or not all rules belong to the user",
        });
      }

      const affectedRules = input.filter(
        (rule) =>
          rule.index !==
          currentRules.find((currentRule) => currentRule.id === rule.id)?.index
      );

      const updatePromises = affectedRules.map((rule) =>
        ctx.prisma.rule.update({
          where: {
            id: rule.id,
          },
          data: {
            index: rule.index,
          },
        })
      );

      // Unique constraint on index would fail if we update without this
      const intermediateUpdatePromises = affectedRules.map((rule) =>
        ctx.prisma.rule.update({
          where: {
            id: rule.id,
          },
          data: {
            index: -rule.index - 1, // -1 to avoid 0
          },
        })
      );

      await ctx.prisma.$transaction([
        ...intermediateUpdatePromises,
        ...updatePromises,
      ]);

      return;
    }),
  changeName: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1),
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
        },
      });
    }),
  changeTheme: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        themeId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const themeCount = await ctx.prisma.theme.count({
        where: {
          id: input.themeId,
          createdById: ctx.auth.userId,
        },
      });

      if (themeCount === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      return ctx.prisma.rule.update({
        where: {
          id: input.id,
          configuration: {
            createdById: ctx.auth.userId,
          },
        },
        data: {
          theme: {
            connect: {
              id: input.themeId,
            },
          },
        },
      });
    }),
  updateCondition: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        condition: conditionSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.rule.update({
        where: {
          id: input.id,
          configuration: {
            createdById: ctx.auth.userId,
          },
        },
        data: {
          condition: input.condition,
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
