import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

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
});
