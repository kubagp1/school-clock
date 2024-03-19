import { type Prisma, type Theme } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  type TRPCContext,
} from "~/server/api/trpc";
import { themeFieldsArraySchema } from "~/utils/theme";
import { Prettify } from "~/utils/utils";

const themeNameSchema = z.string().trim().min(1);

export const themeRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const results = await ctx.prisma.theme.findMany({
      where: {
        createdById: ctx.auth.userId,
      },
      include: {
        _count: {
          select: {
            fields: {
              where: {
                enabled: true,
              },
            },
          },
        },
      },
    });

    return results.map((theme) => ({
      ...theme,
      _count: undefined,
      enabledFieldsCount: theme._count.fields,
    }));
  }),

  getById: privateProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const theme = await ctx.prisma.theme.findUnique({
      where: {
        id: input,
        createdById: ctx.auth.userId,
      },
      include: {
        fields: true,
      },
    });

    if (theme === null) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    return theme;
  }),

  create: privateProcedure
    .input(
      z.object({
        name: themeNameSchema,
        fields: themeFieldsArraySchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.theme.create({
        data: {
          name: input.name,
          createdById: ctx.auth.userId,
          fields: {
            create: input.fields,
          },
        },
      });
    }),

  updateName: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: themeNameSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.theme.update({
        where: {
          id: input.id,
          createdById: ctx.auth.userId,
        },
        data: {
          name: input.name,
        },
      });
    }),

  updateFields: privateProcedure
    .input(
      z.object({
        id: z.string(),
        data: themeFieldsArraySchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkThemeOwnership(ctx, input.id);

      const upserts = input.data.map((field) =>
        ctx.prisma.themeField.upsert({
          where: {
            themeId_name: {
              themeId: input.id,
              name: field.name,
            },
          },
          create: {
            themeId: input.id,
            name: field.name,
            value: field.value,
            enabled: field.enabled,
          },
          update: {
            value: field.value,
            enabled: field.enabled,
          },
        })
      );

      await ctx.prisma.$transaction(upserts);
    }),

  delete: privateProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.theme.delete({
        where: {
          id: input,
          createdById: ctx.auth.userId,
        },
      });
    }),
});

export async function checkThemeOwnership(ctx: TRPCContext, themeId: string) {
  const theme = await ctx.prisma.theme.findUnique({
    where: {
      id: themeId,
    },
  });

  if (theme?.createdById !== ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
}
