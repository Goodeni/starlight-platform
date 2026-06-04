import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, securityLogs, trainingSessions, userPackages } from "@db/schema";
import { eq, like, and, gte, lte, desc, sql } from "drizzle-orm";
import { logSecurityEvent } from "../lib/audit";
import { TRPCError } from "@trpc/server";

export const adminRouter = createRouter({
  // Get all users with pagination and filtering
  getUsers: adminQuery
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        search: z.string().optional(),
        role: z.enum(["user", "trainer", "admin"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;

      let query = db.select().from(users);

      // Apply filters
      const conditions = [];
      if (input?.search) {
        conditions.push(
          like(users.nickname, `%${input.search}%`)
        );
      }
      if (input?.role) {
        conditions.push(eq(users.role, input.role));
      }

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = Number(countResult[0].count);

      // Get users
      const userResults = await db
        .select()
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      // Remove password hashes
      const usersWithoutPasswords = userResults.map((u) => {
        const { passwordHash, ...rest } = u;
        return rest;
      });

      return { users: usersWithoutPasswords, total };
    }),

  // Update user role
  updateUserRole: adminQuery
    .input(
      z.object({
        userId: z.number().int().positive(),
        role: z.enum(["user", "trainer", "admin"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Can't change own role
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Нельзя изменить свою роль",
        });
      }

      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      await logSecurityEvent("role_changed", input.userId, ctx.req.headers, {
        newRole: input.role,
        changedBy: ctx.user.id,
      });

      return { success: true };
    }),

  // Delete user
  deleteUser: adminQuery
    .input(z.object({ userId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Can't delete self
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Нельзя удалить свой аккаунт",
        });
      }

      // Delete related records first
      await db.delete(trainingSessions).where(eq(trainingSessions.userId, input.userId));
      await db.delete(userPackages).where(eq(userPackages.userId, input.userId));

      // Delete user
      await db.delete(users).where(eq(users.id, input.userId));

      await logSecurityEvent("user_deleted", input.userId, ctx.req.headers);

      return { success: true };
    }),

  // Get security logs
  getSecurityLogs: adminQuery
    .input(
      z.object({
        eventType: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 50;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.eventType) {
        conditions.push(eq(securityLogs.eventType, input.eventType));
      }
      if (input?.startDate) {
        conditions.push(gte(securityLogs.createdAt, new Date(input.startDate)));
      }
      if (input?.endDate) {
        conditions.push(lte(securityLogs.createdAt, new Date(input.endDate)));
      }

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(securityLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = Number(countResult[0].count);

      const logs = await db
        .select()
        .from(securityLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(securityLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return { logs, total };
    }),

  // Create database backup (export as JSON)
  createBackup: adminQuery.mutation(async ({ ctx }) => {
    const db = getDb();

    // Get all data
    const allUsers = await db.select().from(users);
    const allSessions = await db.select().from(trainingSessions);
    const allUserPackages = await db.select().from(userPackages);
    const allLogs = await db.select().from(securityLogs);

    // Remove password hashes from backup
    const sanitizedUsers = allUsers.map((u) => {
      const { passwordHash, ...rest } = u;
      return rest;
    });

    const backup = {
      exportedAt: new Date().toISOString(),
      users: sanitizedUsers,
      trainingSessions: allSessions,
      userPackages: allUserPackages,
      securityLogs: allLogs,
    };

    const filename = `starlight_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

    await logSecurityEvent("backup_created", ctx.user.id, ctx.req.headers);

    return {
      backup: JSON.stringify(backup, null, 2),
      filename,
    };
  }),

  // Get dashboard statistics
  getStats: adminQuery.query(async () => {
    const db = getDb();

    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalTrainers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "trainer"));
    const totalSessions = await db.select({ count: sql<number>`count(*)` }).from(trainingSessions);
    const totalPackages = await db.select({ count: sql<number>`count(*)` }).from(userPackages);

    return {
      totalUsers: Number(totalUsers[0].count),
      totalTrainers: Number(totalTrainers[0].count),
      totalSessions: Number(totalSessions[0].count),
      totalPackages: Number(totalPackages[0].count),
    };
  }),
});
