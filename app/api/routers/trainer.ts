import { z } from "zod";
import { createRouter, trainerQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, trainingSessions, userPackages, packages } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const trainerRouter = createRouter({
  // Get ALL users who have purchased any package (visible to trainers)
  getAllStudents: trainerQuery.query(async () => {
    const db = getDb();

    const result = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        age: users.age,
        role: users.role,
        createdAt: users.createdAt,
        packageStatus: userPackages.status,
        packageId: userPackages.id,
        packageName: packages.name,
        trainerId: userPackages.trainerId,
      })
      .from(userPackages)
      .innerJoin(users, eq(userPackages.userId, users.id))
      .innerJoin(packages, eq(userPackages.packageId, packages.id))
      .where(eq(users.role, "user"));

    return result;
  }),

  // Get all available users for session assignment
  getAvailableUsers: trainerQuery.query(async () => {
    const db = getDb();

    // Get users with active packages who don't have a trainer assigned
    const result = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        packageId: userPackages.id,
        packageName: packages.name,
      })
      .from(userPackages)
      .innerJoin(users, eq(userPackages.userId, users.id))
      .innerJoin(packages, eq(userPackages.packageId, packages.id))
      .where(eq(userPackages.status, "active"));

    return result;
  }),

  // Get trainer's assigned students
  getStudents: trainerQuery.query(async ({ ctx }) => {
    const db = getDb();

    const result = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        packageStatus: userPackages.status,
        packageId: userPackages.id,
        packageName: packages.name,
      })
      .from(userPackages)
      .innerJoin(users, eq(userPackages.userId, users.id))
      .innerJoin(packages, eq(userPackages.packageId, packages.id))
      .where(eq(userPackages.trainerId, ctx.user.id));

    return result;
  }),

  // Get trainer's sessions with user details
  getMySessions: trainerQuery.query(async ({ ctx }) => {
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
        userNickname: users.nickname,
        userFirstName: users.firstName,
        userLastName: users.lastName,
      })
      .from(trainingSessions)
      .innerJoin(users, eq(trainingSessions.userId, users.id))
      .where(eq(trainingSessions.trainerId, ctx.user.id))
      .orderBy(desc(trainingSessions.scheduledAt));

    return result;
  }),

  // Create a training session for any student
  createSession: trainerQuery
    .input(
      z.object({
        userId: z.number().int().positive(),
        userPackageId: z.number().int().positive(),
        scheduledAt: z.string().datetime(),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Verify the user package exists and is active
      const packageResult = await db
        .select()
        .from(userPackages)
        .where(
          and(
            eq(userPackages.id, input.userPackageId),
            eq(userPackages.status, "active")
          )
        )
        .limit(1);

      if (packageResult.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Пакет не найден или не активен",
        });
      }

      const result = await db.insert(trainingSessions).values({
        trainerId: ctx.user.id,
        userId: input.userId,
        userPackageId: input.userPackageId,
        scheduledAt: new Date(input.scheduledAt),
        status: "scheduled",
        trainerComment: input.comment || null,
      });

      return {
        success: true,
        sessionId: Number(result[0].insertId),
      };
    }),

  // Update session (reschedule or add comment)
  updateSession: trainerQuery
    .input(
      z.object({
        sessionId: z.number().int().positive(),
        scheduledAt: z.string().datetime().optional(),
        comment: z.string().optional(),
        status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const sessionResult = await db
        .select()
        .from(trainingSessions)
        .where(
          and(
            eq(trainingSessions.id, input.sessionId),
            eq(trainingSessions.trainerId, ctx.user.id)
          )
        )
        .limit(1);

      if (sessionResult.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Сессия не найдена или нет доступа",
        });
      }

      const updateData: Record<string, unknown> = {};
      if (input.scheduledAt) updateData.scheduledAt = new Date(input.scheduledAt);
      if (input.comment !== undefined) updateData.trainerComment = input.comment;
      if (input.status) updateData.status = input.status;

      await db
        .update(trainingSessions)
        .set(updateData)
        .where(eq(trainingSessions.id, input.sessionId));

      return { success: true };
    }),

  // Add comment to a session
  addComment: trainerQuery
    .input(
      z.object({
        sessionId: z.number().int().positive(),
        comment: z.string().min(1, "Комментарий не может быть пустым"),
        rating: z.number().int().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const sessionResult = await db
        .select()
        .from(trainingSessions)
        .where(
          and(
            eq(trainingSessions.id, input.sessionId),
            eq(trainingSessions.trainerId, ctx.user.id)
          )
        )
        .limit(1);

      if (sessionResult.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Сессия не найдена или нет доступа",
        });
      }

      await db
        .update(trainingSessions)
        .set({
          trainerComment: input.comment,
          rating: input.rating || null,
        })
        .where(eq(trainingSessions.id, input.sessionId));

      return { success: true };
    }),

  // Delete session
  deleteSession: trainerQuery
    .input(z.object({ sessionId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const sessionResult = await db
        .select()
        .from(trainingSessions)
        .where(
          and(
            eq(trainingSessions.id, input.sessionId),
            eq(trainingSessions.trainerId, ctx.user.id)
          )
        )
        .limit(1);

      if (sessionResult.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Сессия не найдена или нет доступа",
        });
      }

      await db
        .delete(trainingSessions)
        .where(eq(trainingSessions.id, input.sessionId));

      return { success: true };
    }),

  // Assign trainer to a user's package (admin/trainer can assign)
  assignToPackage: trainerQuery
    .input(
      z.object({
        userPackageId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      await db
        .update(userPackages)
        .set({ trainerId: ctx.user.id })
        .where(eq(userPackages.id, input.userPackageId));

      return { success: true };
    }),

  // Get trainer dashboard stats
  getStats: trainerQuery.query(async ({ ctx }) => {
    const db = getDb();

    const totalStudents = await db
      .select({ count: sql<number>`count(distinct ${userPackages.userId})` })
      .from(userPackages)
      .where(eq(userPackages.trainerId, ctx.user.id));

    const upcomingSessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.trainerId, ctx.user.id),
          eq(trainingSessions.status, "scheduled")
        )
      );

    const completedSessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.trainerId, ctx.user.id),
          eq(trainingSessions.status, "completed")
        )
      );

    return {
      totalStudents: Number(totalStudents[0].count),
      upcomingSessions: Number(upcomingSessions[0].count),
      completedSessions: Number(completedSessions[0].count),
    };
  }),
});
