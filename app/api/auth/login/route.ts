import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_EMAIL } from "@/lib/constants";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
const inputSchema = z.object({ email: z.email(), password: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const throttle = await rateLimit(`login:${requestIp(request)}`, 8, 15 * 60 * 1000);
  if (!throttle.allowed) return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429, headers: { "Retry-After": String(throttle.retryAfter) } });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  const user = parsed.data.email.toLowerCase() === ADMIN_EMAIL ? await prisma.adminUser.findUnique({ where: { email: ADMIN_EMAIL } }) : null;
  const valid = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
