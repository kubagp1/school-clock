import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { RequestLike } from "@clerk/nextjs/dist/types/server/types";
import superjson from "superjson";

export const createSSRHelpers = async (req: RequestLike) =>
  createServerSideHelpers({
    router: appRouter,
    ctx: await createInnerTRPCContext(req),
    transformer: superjson,
  });
