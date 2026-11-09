import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  prefix?: string;
}

export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetSeconds: number; clientIp: string } {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");
  const clientIp = (cfIp || realIp || (forwarded ? forwarded.split(",")[0] : null) || "127.0.0.1").trim();

  const prefix = options.prefix || "global";
  const key = `${prefix}:${clientIp}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetSeconds: Math.ceil(options.windowMs / 1000),
      clientIp,
    };
  }

  if (record.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.ceil((record.resetAt - now) / 1000),
      clientIp,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: options.limit - record.count,
    resetSeconds: Math.ceil((record.resetAt - now) / 1000),
    clientIp,
  };
}
