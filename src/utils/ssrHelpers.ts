import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { type RequestLike } from "@clerk/nextjs/dist/types/server/types";
import superjson from "superjson";

export const createSSRHelpers = (req: RequestLike) =>
  createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ req }),
    transformer: superjson,
  });
