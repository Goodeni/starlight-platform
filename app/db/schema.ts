import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  boolean,
  bigint,
  json,
} from "drizzle-orm/mysql-core";

// Main users table with custom auth
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  nickname: varchar("nickname", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  age: int("age").notNull(),
  messengerLink: varchar("messenger_link", { length: 255 }),
  role: mysqlEnum("role", ["user", "trainer", "admin"]).default("user").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// OTP codes for login and email/phone verification
export const otpCodes = mysqlTable("otp_codes", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 255 }).notNull(),
  purpose: mysqlEnum("purpose", ["login", "email_verify", "phone_verify"]).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OtpCode = typeof otpCodes.$inferSelect;

// Custom sessions (not Kimi OAuth)
export const sessions = mysqlTable("sessions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;

// Training packages
export const packages = mysqlTable("packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  price: int("price").notNull(),
  description: text("description").notNull(),
  features: json("features").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Package = typeof packages.$inferSelect;

// User purchased packages
export const userPackages = mysqlTable("user_packages", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  packageId: bigint("package_id", { mode: "number", unsigned: true }).notNull(),
  trainerId: bigint("trainer_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type UserPackage = typeof userPackages.$inferSelect;

// Training sessions
export const trainingSessions = mysqlTable("training_sessions", {
  id: serial("id").primaryKey(),
  trainerId: bigint("trainer_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  userPackageId: bigint("user_package_id", { mode: "number", unsigned: true }).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  trainerComment: text("trainer_comment"),
  rating: int("rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type TrainingSession = typeof trainingSessions.$inferSelect;

// Security audit logs
export const securityLogs = mysqlTable("security_logs", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SecurityLog = typeof securityLogs.$inferSelect;
