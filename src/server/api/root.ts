import { createTRPCRouter } from "~/server/api/trpc";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";

import { configurationRouter } from "./routers/configuration";
import { themeRouter } from "./routers/theme";
import { instanceRouter } from "./routers/instance";
import { instanceSecretRequestRouter } from "./routers/instanceSecretRequest";
import { ruleRouter } from "./routers/rule";
import { newsTickerRouter } from "./routers/newsTicker";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  configuration: configurationRouter,
  theme: themeRouter,
  instance: instanceRouter,
  instanceSecretRequest: instanceSecretRequestRouter,
  rule: ruleRouter,
  newsTicker: newsTickerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
