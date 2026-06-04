import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { trainerRouter } from "./routers/trainer";
import { adminRouter } from "./routers/admin";
import { securityRouter } from "./routers/security";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  user: userRouter,
  trainer: trainerRouter,
  admin: adminRouter,
  security: securityRouter,
});

export type AppRouter = typeof appRouter;
