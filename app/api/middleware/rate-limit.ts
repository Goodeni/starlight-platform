import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

// Simple in-memory rate limiter
// In production, use Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  // Get client IP
  const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const key = `auth:${ip}`;

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5; // 5 requests per minute

  const record = rateLimitStore.get(key);

  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
  } else {
    // Existing window
    if (record.count >= maxRequests) {
      throw new HTTPException(429, { message: "Слишком много запросов. Попробуйте позже." });
    }
    record.count++;
  }

  await next();
});
