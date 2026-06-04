import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, otpCodes, sessions } from "@db/schema";
import { eq, and, gt, desc } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  hashOTP,
  verifyOTP,
  createSession,
  SESSION_COOKIE,
  getSessionCookieOptions,
} from "../lib/session";
import { logSecurityEvent } from "../lib/audit";
import { TRPCError } from "@trpc/server";

// Password validation schema
const passwordSchema = z.string()
  .min(8, "Минимум 8 символов")
  .regex(/[A-Z]/, "Должна быть заглавная буква")
  .regex(/[a-z]/, "Должна быть строчная буква")
  .regex(/[0-9]/, "Должна быть цифра");

export const authRouter = createRouter({
  // Registration
  register: publicQuery
    .input(
      z.object({
        firstName: z.string().min(1, "Имя обязательно").max(100),
        lastName: z.string().min(1, "Фамилия обязательна").max(100),
        middleName: z.string().max(100).optional(),
        nickname: z.string().min(3, "Минимум 3 символа").max(20, "Максимум 20 символов"),
        email: z.string().email("Неверный email"),
        phone: z.string().regex(/^\+?[\d\s()-]{7,20}$/, "Неверный номер телефона"),
        age: z.number().int().min(12, "Минимум 12 лет").max(99, "Максимум 99 лет"),
        password: passwordSchema,
        messengerLink: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Check if nickname, email or phone already exists — do all 3 checks for specific error messages
      const existingNickname = await db
        .select()
        .from(users)
        .where(eq(users.nickname, input.nickname))
        .limit(1);

      if (existingNickname.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Никнейм уже занят. Выберите другой.",
        });
      }

      const existingEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingEmail.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email уже зарегистрирован. Используйте другой email или войдите в аккаунт.",
        });
      }

      const existingPhone = await db
        .select()
        .from(users)
        .where(eq(users.phone, input.phone))
        .limit(1);

      if (existingPhone.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Номер телефона уже зарегистрирован. Используйте другой номер.",
        });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Auto-assign role based on nickname
      let role: "user" | "trainer" | "admin" = "user";
      const lowerNick = input.nickname.toLowerCase();
      if (lowerNick === "admin") {
        role = "admin";
      } else if (["goodeni", "egmen", "vir9in"].includes(lowerNick)) {
        role = "trainer";
      }

      // Create user
      const result = await db.insert(users).values({
        nickname: input.nickname,
        email: input.email,
        phone: input.phone,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        middleName: input.middleName || null,
        age: input.age,
        messengerLink: input.messengerLink || null,
        role,
      });

      const userId = Number(result[0].insertId);

      // Log security event
      await logSecurityEvent("register", userId, ctx.req.headers);

      return { success: true, message: "Регистрация успешна" };
    }),

  // Login Step 1 - Validate credentials, send OTP
  loginStep1: publicQuery
    .input(
      z.object({
        nickname: z.string().min(1, "Введите никнейм"),
        password: z.string().min(1, "Введите пароль"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Find user by nickname
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.nickname, input.nickname))
        .limit(1);

      if (userResult.length === 0) {
        await logSecurityEvent("login_failed", undefined, ctx.req.headers, { reason: "user_not_found", nickname: input.nickname });
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Неверный никнейм или пароль",
        });
      }

      const user = userResult[0];

      // Verify password
      const validPassword = await verifyPassword(input.password, user.passwordHash);
      if (!validPassword) {
        await logSecurityEvent("login_failed", user.id, ctx.req.headers, { reason: "wrong_password" });
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Неверный никнейм или пароль",
        });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = await hashOTP(otp);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      // Invalidate old OTPs
      await db
        .update(otpCodes)
        .set({ used: true })
        .where(and(eq(otpCodes.userId, user.id), eq(otpCodes.purpose, "login")));

      // Store new OTP
      await db.insert(otpCodes).values({
        userId: user.id,
        code: otpHash,
        purpose: "login",
        expiresAt,
      });

      // Log OTP for demo
      console.log(`[OTP LOGIN] User: ${user.email}, Code: ${otp}`);

      await logSecurityEvent("otp_sent", user.id, ctx.req.headers, { purpose: "login" });

      return { success: true, message: "Код отправлен на email", otpCode: otp };
    }),

  // Login Step 2 - Validate OTP, create session
  loginStep2: publicQuery
    .input(
      z.object({
        nickname: z.string().min(1),
        otpCode: z.string().length(6, "Код должен быть 6 цифр"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Find user
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.nickname, input.nickname))
        .limit(1);

      if (userResult.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Пользователь не найден",
        });
      }

      const user = userResult[0];

      // Find latest unused OTP
      const otpResult = await db
        .select()
        .from(otpCodes)
        .where(
          and(
            eq(otpCodes.userId, user.id),
            eq(otpCodes.purpose, "login"),
            eq(otpCodes.used, false),
            gt(otpCodes.expiresAt, new Date())
          )
        )
        .orderBy(desc(otpCodes.createdAt))
        .limit(1);

      if (otpResult.length === 0) {
        await logSecurityEvent("otp_failed", user.id, ctx.req.headers, { reason: "no_valid_otp" });
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Код недействителен или истек. Запросите новый.",
        });
      }

      const otpRecord = otpResult[0];

      // Verify OTP
      const validOtp = await verifyOTP(input.otpCode, otpRecord.code);
      if (!validOtp) {
        await logSecurityEvent("otp_failed", user.id, ctx.req.headers, { reason: "invalid_code" });
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Неверный код",
        });
      }

      // Mark OTP as used
      await db
        .update(otpCodes)
        .set({ used: true })
        .where(eq(otpCodes.id, otpRecord.id));

      // Create session
      const ipAddress = ctx.req.headers.get("x-forwarded-for") || undefined;
      const userAgent = ctx.req.headers.get("user-agent") || undefined;
      const token = await createSession(user.id, ipAddress, userAgent);

      // Set cookie
      const cookieOpts = getSessionCookieOptions();
      ctx.resHeaders.append(
        "Set-Cookie",
        `${SESSION_COOKIE}=${token}; HttpOnly; Path=${cookieOpts.path}; SameSite=${cookieOpts.sameSite}; Max-Age=${cookieOpts.maxAge}${cookieOpts.secure ? "; Secure" : ""}`
      );

      await logSecurityEvent("login_success", user.id, ctx.req.headers);

      return { success: true, token };
    }),

  // Verify email with OTP
  verifyEmail: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        otpCode: z.string().length(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Find user by email
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (userResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        });
      }

      const user = userResult[0];

      // Find OTP
      const otpResult = await db
        .select()
        .from(otpCodes)
        .where(
          and(
            eq(otpCodes.userId, user.id),
            eq(otpCodes.purpose, "email_verify"),
            eq(otpCodes.used, false),
            gt(otpCodes.expiresAt, new Date())
          )
        )
        .orderBy(desc(otpCodes.createdAt))
        .limit(1);

      if (otpResult.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Код недействителен или истек",
        });
      }

      const otpRecord = otpResult[0];
      const validOtp = await verifyOTP(input.otpCode, otpRecord.code);

      if (!validOtp) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Неверный код",
        });
      }

      // Mark OTP as used
      await db
        .update(otpCodes)
        .set({ used: true })
        .where(eq(otpCodes.id, otpRecord.id));

      // Mark email as verified
      await db
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.id, user.id));

      await logSecurityEvent("email_verified", user.id, ctx.req.headers);

      return { success: true };
    }),

  // Request email verification from profile (authed)
  requestEmailVerify: publicQuery.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Требуется авторизация" });
    }
    const db = getDb();
    const user = ctx.user;

    if (user.emailVerified) {
      return { success: true, alreadyVerified: true };
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Invalidate old OTPs
    await db
      .update(otpCodes)
      .set({ used: true })
      .where(and(eq(otpCodes.userId, user.id), eq(otpCodes.purpose, "email_verify")));

    await db.insert(otpCodes).values({
      userId: user.id,
      code: otpHash,
      purpose: "email_verify",
      expiresAt,
    });

    console.log(`[OTP EMAIL VERIFY] User: ${user.email}, Code: ${otp}`);
    await logSecurityEvent("otp_sent", user.id, ctx.req.headers, { purpose: "email_verify" });

    return { success: true, alreadyVerified: false, email: user.email, otpCode: otp };
  }),

  // Resend OTP
  resendOtp: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        purpose: z.enum(["login", "email_verify", "phone_verify"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (userResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        });
      }

      const user = userResult[0];

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = await hashOTP(otp);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      // Invalidate old OTPs of same purpose
      await db
        .update(otpCodes)
        .set({ used: true })
        .where(and(eq(otpCodes.userId, user.id), eq(otpCodes.purpose, input.purpose)));

      await db.insert(otpCodes).values({
        userId: user.id,
        code: otpHash,
        purpose: input.purpose,
        expiresAt,
      });

      console.log(`[OTP RESEND] User: ${user.email}, Purpose: ${input.purpose}, Code: ${otp}`);

      return { success: true, otpCode: otp };
    }),

  // Get current user (me) — always fetch fresh data from DB
  me: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) return null;

    const db = getDb();
    const freshUser = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (freshUser.length === 0) return null;

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = freshUser[0];
    return userWithoutPassword;
  }),

  // Logout
  logout: publicQuery.mutation(async ({ ctx }) => {
    const cookieHeader = ctx.req.headers.get("cookie");
    if (cookieHeader) {
      const cookies = parseCookieHeader(cookieHeader);
      const token = cookies[SESSION_COOKIE];
      if (token) {
        await deleteSession(token);
      }
    }

    // Clear cookie
    ctx.resHeaders.append(
      "Set-Cookie",
      `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0`
    );

    return { success: true };
  }),

  // Change password
  changePassword: publicQuery
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: passwordSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Требуется авторизация",
        });
      }

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

      const user = userResult[0];
      const validPassword = await verifyPassword(input.currentPassword, user.passwordHash);

      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Неверный текущий пароль",
        });
      }

      const newHash = await hashPassword(input.newPassword);
      await db
        .update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.id, user.id));

      await logSecurityEvent("password_changed", user.id, ctx.req.headers);

      return { success: true };
    }),

  // Update profile
  updateProfile: publicQuery
    .input(
      z.object({
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        middleName: z.string().max(100).optional(),
        phone: z.string().regex(/^\+?[\d\s()-]{7,20}$/).optional(),
        messengerLink: z.string().max(255).optional(),
        age: z.number().int().min(12).max(99).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Требуется авторизация",
        });
      }

      const db = getDb();
      const updateData: Record<string, unknown> = {};

      if (input.firstName !== undefined) updateData.firstName = input.firstName;
      if (input.lastName !== undefined) updateData.lastName = input.lastName;
      if (input.middleName !== undefined) updateData.middleName = input.middleName || null;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.messengerLink !== undefined) updateData.messengerLink = input.messengerLink || null;
      if (input.age !== undefined) updateData.age = input.age;

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id));

      const updatedUser = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      const { passwordHash, ...userWithoutPassword } = updatedUser[0];
      return { success: true, user: userWithoutPassword };
    }),
});

// Helper to parse cookies from header
function parseCookieHeader(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  header.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name && rest.length > 0) {
      cookies[name] = rest.join("=");
    }
  });
  return cookies;
}
