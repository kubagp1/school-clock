import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import {
  type TRPCContext,
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const instanceSecretRequestRouter = createTRPCRouter({
  create: publicProcedure.mutation(async ({ ctx }) => {
    // cleanup old requests
    await ctx.prisma.instanceSecretRequest.deleteMany({
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
        requestCode: z.string().min(1),
        claimToken: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const secretRequest = await ctx.prisma.instanceSecretRequest.findUnique({
        where: {
          requestCode: input.requestCode,
          claimToken: input.claimToken,
        },
      });

      if (!secretRequest) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (secretRequest.instanceSecret === null) return null;

      await ctx.prisma.instanceSecretRequest.delete({
        where: {
          requestCode: input.requestCode,
          claimToken: input.claimToken,
        },
      });

      return secretRequest.instanceSecret;
    }),
  setSecret: privateProcedure
    .input(
      z.object({
        requestCode: z.string().min(1),
        instanceId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      input.requestCode = Array.from(input.requestCode)
        .filter((c) => "0123456789".includes(c))
        .join("");

      const validInstancesCount = await ctx.prisma.instance.count({
        where: {
          id: input.instanceId,
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

      const updatedInstance = await ctx.prisma.instance.update({
        where: {
          id: input.instanceId,
        },
        data: {
          secret: randomUUID(),
          lastSeen: null,
        },
      });

      await ctx.prisma.instanceSecretRequest.update({
        where: {
          requestCode: input.requestCode,
        },
        data: {
          instanceSecret: updatedInstance.secret,
        },
      });
    }),
});
