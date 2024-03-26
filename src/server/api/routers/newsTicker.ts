import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { getAvailableRuleIndex } from "./rule";
import {
  type Condition,
  booleanConditionSchema,
  datetimeConditionSchema,
} from "~/utils/conditions";
import { type PrismaClient, type Prisma } from "@prisma/client";
import { type DefaultArgs } from "@prisma/client/runtime/library";
import { newNewsTickerSchema, newsTickerSchema } from "~/utils/newsTicker";

export const newsTickerRouter = createTRPCRouter({
  getAll: privateProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const newsTickers = await ctx.prisma.newsTicker.findMany({
        where: {
          configuration: {
            id: input,
            createdById: ctx.auth.userId,
          },
        },
        include: {
          rule: {
            include: {
              theme: {
                include: {
                  fields: true,
                },
              },
            },
          },
        },
      });

      return newsTickers.map((newsTicker) =>
        newsTickerSchema.parse({
          id: newsTicker.id,
          configurationId: newsTicker.configurationId,
          startAt: new Date(
            datetimeConditionSchema.parse(
              booleanConditionSchema
                .parse(newsTicker.rule.condition)
                .conditions.find(
                  (condition) =>
                    condition.type === "datetime" && condition.operator === "gt"
                )
            ).value
          ),
          endAt: new Date(
            datetimeConditionSchema.parse(
              booleanConditionSchema
                .parse(newsTicker.rule.condition)
                .conditions.find(
                  (condition) =>
                    condition.type === "datetime" && condition.operator === "lt"
                )
            ).value
          ),
          text: newsTicker.rule.theme.fields.find(
            (field) => field.name === "newsTickerText"
          )?.value,
          loop: newsTicker.rule.theme.fields.find(
            (field) => field.name === "newsTickerLoop"
          )?.value,
          speed: newsTicker.rule.theme.fields.find(
            (field) => field.name === "newsTickerSpeed"
          )?.value,
          forceHiddenFalse: newsTicker.rule.theme.fields.find(
            (field) => field.name === "newsTickerHidden"
          )?.value,
        })
      );
    }),
  create: privateProcedure
    .input(newNewsTickerSchema)
    .mutation(async ({ ctx, input }) => {
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

      await ctx.prisma.$transaction(async (tx) => {
        await createNewsTickerTranstaction(tx, input, ctx.auth.userId);
      });
    }),
  update: privateProcedure
    .input(newsTickerSchema.omit({ configurationId: true }))
    .mutation(async ({ ctx, input }) => {
      const newsTickerCount = await ctx.prisma.newsTicker.count({
        where: {
          id: input.id,
          configuration: {
            createdById: ctx.auth.userId,
          },
        },
      });

      if (newsTickerCount === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      await ctx.prisma.$transaction(async (tx) => {
        const oldNewsTicker = await deleteNewsTickerTransaction(
          tx,
          input.id,
          ctx.auth.userId
        );

        await createNewsTickerTranstaction(
          tx,
          { ...input, configurationId: oldNewsTicker.configurationId },
          ctx.auth.userId
        );
      });
    }),
  delete: privateProcedure
    .input(z.string().min(1))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(async (tx) => {
        await deleteNewsTickerTransaction(tx, input, ctx.auth.userId);
      });
    }),
});

type PrismaTransactionClient = StrictOmit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const deleteNewsTickerTransaction = async (
  tx: PrismaTransactionClient,
  newsTickerId: string,
  userId: string
) => {
  const newsTicker = await tx.newsTicker.delete({
    where: {
      id: newsTickerId,
      configuration: {
        createdById: userId,
      },
    },
    include: {
      rule: true,
    },
  });

  await tx.rule.delete({
    where: {
      id: newsTicker.ruleId,
    },
  });

  await tx.theme.delete({
    where: {
      id: newsTicker.rule.themeId,
    },
  });

  return newsTicker;
};

const createNewsTickerTranstaction = async (
  tx: PrismaTransactionClient,
  input: z.infer<typeof newNewsTickerSchema>,
  userId: string
) => {
  const theme = await tx.theme.create({
    data: {
      name: "newsTicker internal theme",
      createdById: userId,
      internal: true,
      fields: {
        createMany: {
          data: [
            {
              enabled: input.forceHiddenFalse,
              name: "newsTickerHidden",
              value: false,
            },
            { enabled: true, name: "newsTickerText", value: input.text },
            { enabled: true, name: "newsTickerLoop", value: input.loop },
            {
              enabled: true,
              name: "newsTickerSpeed",
              value: input.speed,
            },
          ],
        },
      },
    },
  });

  const availableIndex = await getAvailableRuleIndex(
    tx,
    userId,
    input.configurationId,
    "newsTicker"
  );

  const rule = await tx.rule.create({
    data: {
      configuration: {
        connect: {
          id: input.configurationId,
        },
      },
      theme: {
        connect: {
          id: theme.id,
        },
      },
      name: "newsTicker internal rule",
      index: availableIndex,
      internalGroup: "newsTicker",
      condition: {
        type: "boolean",
        operator: "and",
        conditions: [
          // TODO: Change to "gte" and "lte" when we implement new operators
          {
            type: "datetime",
            operator: "gt",
            value: input.startAt.toISOString(),
          },
          {
            type: "datetime",
            operator: "lt",
            value: input.endAt.toISOString(),
          },
        ],
      } satisfies Condition,
    },
  });

  await tx.newsTicker.create({
    data: {
      configuration: {
        connect: {
          id: input.configurationId,
        },
      },
      rule: {
        connect: {
          id: rule.id,
        },
      },
    },
  });
};
