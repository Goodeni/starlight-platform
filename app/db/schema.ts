import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  bigint,
  json,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "trainer", "admin"]);
export const otpPurposeEnum = pgEnum("otp_purpose", ["login", "email_verify", "phone_verify"]);
export const packageStatusEnum = pgEnum("package_status", ["active", "completed", "cancelled"]);
export const sessionStatusEnum = pgEnum("session_status", ["scheduled", "completed", "cancelled"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nickname: varchar("nickname", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  age: integer("age").notNull(),
  messengerLink: varchar("messenger_link", { length: 255 }),
  role: roleEnum("role").default("user").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  code: varchar("code", { length: 255 }).notNull(),
  purpose: otpPurposeEnum("purpose").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OtpCode = typeof otpCodes.$inferSelect;

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  features: json("features").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Package = typeof packages.$inferSelect;

export const userPackages = pgTable("user_packages", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  packageId: bigint("package_id", { mode: "number" }).notNull(),
  trainerId: bigint("trainer_id", { mode: "number" }),
  status: packageStatusEnum("status").default("active").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type UserPackage = typeof userPackages.$inferSelect;

export const trainingSessions = pgTable("training_sessions", {
  id: serial("id").primaryKey(),
  trainerId: bigint("trainer_id", { mode: "number" }).notNull(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  userPackageId: bigint("user_package_id", { mode: "number" }).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: sessionStatusEnum("status").default("scheduled").notNull(),
  trainerComment: text("trainer_comment"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type TrainingSession = typeof trainingSessions.$inferSelect;

export const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  userId: bigint("user_id", { mode: "number" }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SecurityLog = typeof securityLogs.$inferSelect;
