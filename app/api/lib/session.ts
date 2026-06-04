import { getDb } from "../queries/connection";
import { users, sessions } from "@db/schema";
import { eq, and, gt } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import crypto from "crypto";
import type { User } from "@db/schema";

// Session cookie name
export const SESSION_COOKIE = "sl_session";

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

// Compare password with hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

// Generate a random session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Hash OTP for storage
export async function hashOTP(otp: string): Promise<string> {
  return hash(otp, 10);
}

// Verify OTP hash
export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  return compare(otp, hash);
}

// Create a new session
export async function createSession(userId: number, ipAddress?: string, userAgent?: string) {
  const db = getDb();
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await db.insert(sessions).values({
    userId,
    token,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    expiresAt,
  });

  return token;
}

// Authenticate a request by session cookie
export async function authenticateSession(req: Request): Promise<User | undefined> {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return undefined;

  // Parse cookies
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies[SESSION_COOKIE];
  if (!sessionToken) return undefined;

  const db = getDb();
  const now = new Date();

  // Find valid session
  const sessionResult = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, sessionToken), gt(sessions.expiresAt, now)))
    .limit(1);

  if (sessionResult.length === 0) return undefined;

  const session = sessionResult[0];

  // Get user
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (userResult.length === 0) return undefined;

  return userResult[0];
}

// Delete a session (logout)
export async function deleteSession(token: string) {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.token, token));
}

// Get session cookie options
export function getSessionCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}

// Helper: parse cookies from header
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name && rest.length > 0) {
      cookies[name] = rest.join("=");
    }
  });
  return cookies;
}
