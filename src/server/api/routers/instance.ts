import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  type TRPCContext,
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const instanceNameSchema = z.string().trim().min(1);

export const instanceRouter = createTRPCRouter({
  getAll: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.instance.findMany({
      where: {
        configuration: {
          createdById: {
            equals: ctx.auth.userId,
          },
        },
      },
    });
  }),
  getById: privateProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const instance = await ctx.prisma.instance.findUnique({
      where: {
        id: input,
        configuration: {
          createdById: ctx.auth.userId,
        },
      },
    });

    if (instance === null) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    return instance;
  }),
  getBySecret: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const instance = await ctx.prisma.instance.findUnique({
        where: {
          secret: input,
        },
        include: {
          configuration: {
            include: {
              baseTheme: {
                include: {
                  fields: true,
                },
              },
              rules: {
                include: {
                  theme: {
                    include: {
                      fields: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (instance === null) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      await ctx.prisma.instance.update({
        where: {
          id: instance.id,
        },
        data: {
          lastSeen: new Date(),
        },
      });

      return instance;
    }),
  delete: privateProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.instance.delete({
        where: {
          id: input,
          configuration: {
            createdById: ctx.auth.userId,
          },
        },
      });
    }),
  changeName: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: instanceNameSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.instance.update({
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
  create: privateProcedure
    .input(
      z.object({
        name: instanceNameSchema,
        configurationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.instance.create({
        data: {
          name: input.name,
          configuration: {
            connect: {
              id: input.configurationId,
            },
          },
        },
      });
    }),
});
