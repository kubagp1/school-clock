import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  type TRPCContext,
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const instanceSecretRequestRouter = createTRPCRouter({
  create: publicProcedure.mutation(({ ctx }) => {
    // cleanup old requests
    void ctx.prisma.instanceSecretRequest.deleteMany({
      where: {
        createdAt: {
          lte: new Date(Date.now() - 1000 * 60 * 60),
        },
      },
    });

    return ctx.prisma.instanceSecretRequest.create({
      data: {
        requestCode: Math.floor(
          100000000 + Math.random() * 900000000
        ).toString(),
      },
    });
  }),
  getSecret: publicProcedure
    .input(
      z.object({
        requestCode: z.string(),
        claimToken: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const secretRequest = await ctx.prisma.instanceSecretRequest.delete({
        where: {
          requestCode: input.requestCode,
          claimToken: input.claimToken,
          instanceSecret: {
            not: null,
          },
        },
      });

      if (secretRequest === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (secretRequest.instanceSecret === null) {
        return null;
      }

      return secretRequest.instanceSecret;
    }),
  setSecret: privateProcedure
    .input(
      z.object({
        requestCode: z.string(),
        instanceSecret: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const validInstancesCount = await ctx.prisma.instance.count({
        where: {
          secret: input.instanceSecret,
          configuration: {
            createdById: ctx.auth.userId,
          },
        },
      });

      if (validInstancesCount === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const requestsWithNoSecretCount =
        await ctx.prisma.instanceSecretRequest.count({
          where: {
            requestCode: input.requestCode,
            instanceSecret: null,
          },
        });

      if (requestsWithNoSecretCount === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
        });
      }

      await ctx.prisma.instanceSecretRequest.update({
        where: {
          requestCode: input.requestCode,
        },
        data: {
          instanceSecret: input.instanceSecret,
        },
      });
    }),
});
