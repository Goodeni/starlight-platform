import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, userPackages, packages, trainingSessions } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const userRouter = createRouter({
  // Get current user profile
  getProfile: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (userResult.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Пользователь не найден",
      });
    }

    const { passwordHash, ...userWithoutPassword } = userResult[0];
    return userWithoutPassword;
  }),

  // Get user's purchased packages with trainer info
  getMyPackages: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db
      .select({
        id: userPackages.id,
        status: userPackages.status,
        purchaseDate: userPackages.purchaseDate,
        completedAt: userPackages.completedAt,
        trainerId: userPackages.trainerId,
        package: {
          id: packages.id,
          name: packages.name,
          price: packages.price,
          description: packages.description,
          features: packages.features,
        },
      })
      .from(userPackages)
      .innerJoin(packages, eq(userPackages.packageId, packages.id))
      .where(eq(userPackages.userId, ctx.user.id))
      .orderBy(desc(userPackages.purchaseDate));

    return result;
  }),

  // Get user's training schedule with trainer details
  getSchedule: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db
      .select({
        id: trainingSessions.id,
        trainerId: trainingSessions.trainerId,
        userId: trainingSessions.userId,
        userPackageId: trainingSessions.userPackageId,
        scheduledAt: trainingSessions.scheduledAt,
        status: trainingSessions.status,
        trainerComment: trainingSessions.trainerComment,
        rating: trainingSessions.rating,
        createdAt: trainingSessions.createdAt,
        trainerNickname: users.nickname,
        trainerFirstName: users.firstName,
        trainerLastName: users.lastName,
      })
      .from(trainingSessions)
      .innerJoin(users, eq(trainingSessions.trainerId, users.id))
      .where(eq(trainingSessions.userId, ctx.user.id))
      .orderBy(desc(trainingSessions.scheduledAt));

    return result;
  }),

  // Get upcoming sessions for calendar view
  getUpcomingSessions: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db
      .select({
        id: trainingSessions.id,
        scheduledAt: trainingSessions.scheduledAt,
        status: trainingSessions.status,
        trainerComment: trainingSessions.trainerComment,
        trainerNickname: users.nickname,
        trainerFirstName: users.firstName,
        trainerLastName: users.lastName,
      })
      .from(trainingSessions)
      .innerJoin(users, eq(trainingSessions.trainerId, users.id))
      .where(eq(trainingSessions.userId, ctx.user.id))
      .orderBy(desc(trainingSessions.scheduledAt));

    return result;
  }),

  // Purchase a package (mock payment)
  purchasePackage: authedQuery
    .input(z.object({ packageId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const packageResult = await db
        .select()
        .from(packages)
        .where(eq(packages.id, input.packageId))
        .limit(1);

      if (packageResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пакет не найден",
        });
      }

      await db.insert(userPackages).values({
        userId: ctx.user.id,
        packageId: input.packageId,
        status: "active",
      });

      return { success: true };
    }),
});
