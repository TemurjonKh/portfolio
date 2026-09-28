import "server-only";
import { prisma } from "@/lib/prisma";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const existing = await prisma.rateLimit.findUnique({ where: { key } });
  if (!existing || now.getTime() - existing.windowStart.getTime() >= windowMs) {
    await prisma.rateLimit.upsert({ where: { key }, create: { key, count: 1, windowStart: now }, update: { count: 1, windowStart: now } });
    return { allowed: true, retryAfter: 0 };
  }
  if (existing.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((windowMs - (now.getTime() - existing.windowStart.getTime())) / 1000) };
  }
  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return { allowed: true, retryAfter: 0 };
}

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
