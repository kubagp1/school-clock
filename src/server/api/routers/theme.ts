import { Prisma } from "@prisma/client";
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
  getAll: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.theme.findMany({
      where: {
        createdById: {
          equals: ctx.auth.userId,
        },
      },
    });
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

// INTEGRITY CHECKS

type ThemeData = Omit<
  Required<Prisma.ThemeCreateInput>,
  | "id"
  | "name"
  | "createdById"
  | "themes"
  | "configurations"
  | "rules"
  | "_count"
>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typeGuard = (foo: ThemeData): z.infer<typeof themeDataSchema> => foo;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typeGuard2 = (foo: z.infer<typeof themeDataSchema>): ThemeData => foo;
