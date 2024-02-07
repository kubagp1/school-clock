import { type Prisma, type Theme } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  type TRPCContext,
} from "~/server/api/trpc";

const themeNameSchema = z.string().trim().min(1);

const themeDataSchema = z.object({
  hideClock: z.boolean().nullable(),
  clockColor: z.string().nullable(),
  clockSize: z.number().nullable(),
});

export const themeRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const results = await ctx.prisma.theme.findMany({
      where: {
        createdById: {
          equals: ctx.auth.userId,
        },
      },
    });

    // count of non-null values in data fields in theme
    return results.map((theme) => ({
      ...theme,
      enabledFieldsCount: Object.values(onlyData(theme)).filter(
        (v) => v !== null
      ).length,
    }));
  }),
  getById: privateProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const theme = await ctx.prisma.theme.findUnique({
      where: {
        id: input,
      },
    });

    if (theme?.createdById !== ctx.auth.userId) {
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
        data: themeDataSchema,
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.theme.create({
        data: {
          name: input.name,
          createdById: ctx.auth.userId,
          ...input.data,
        },
      });
    }),
  changeName: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: themeNameSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkThemeOwnership(ctx, input.id);

      return ctx.prisma.theme.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  changeData: privateProcedure
    .input(
      z.object({
        id: z.string(),
        data: themeDataSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkThemeOwnership(ctx, input.id);

      return ctx.prisma.theme.update({
        where: {
          id: input.id,
        },
        data: input.data,
      });
    }),
  delete: privateProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await checkThemeOwnership(ctx, input);

      await ctx.prisma.theme.delete({
        where: {
          id: input,
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

const nonDataFields = ["id", "name", "createdById"] as const;

const onlyData = (theme: Theme) => {
  const { id, name, createdById, ...data } = theme;
  return data;
};

// INTEGRITY CHECKS

export type ThemeData = StrictOmit<
  Required<Theme>,
  (typeof nonDataFields)[number]
>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typeGuard = (foo: ThemeData): z.infer<typeof themeDataSchema> => foo;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typeGuard2 = (foo: z.infer<typeof themeDataSchema>): ThemeData => foo;
