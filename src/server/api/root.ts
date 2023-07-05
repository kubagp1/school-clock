import { createTRPCRouter } from "~/server/api/trpc";
import { configurationRouter } from "./routers/configuration";
import { themeRouter } from "./routers/themeRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  configuration: configurationRouter,
  theme: themeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
