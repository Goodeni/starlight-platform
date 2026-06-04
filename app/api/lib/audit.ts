import { getDb } from "../queries/connection";
import { securityLogs } from "@db/schema";

export async function logSecurityEvent(
  eventType: string,
  userId?: number,
  headers?: Headers,
  details?: Record<string, unknown>
) {
  try {
    const db = getDb();
    const ipAddress = headers?.get("x-forwarded-for") || headers?.get("x-real-ip") || null;
    const userAgent = headers?.get("user-agent") || null;

    await db.insert(securityLogs).values({
      eventType,
      userId: userId || null,
      ipAddress,
      userAgent,
      details: details || null,
    });
  } catch (error) {
    // Don't let audit logging failures break the application
    console.error("Failed to log security event:", error);
  }
}
