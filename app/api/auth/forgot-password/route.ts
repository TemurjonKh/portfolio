import { randomBytes } from "crypto";
import { siteUrl } from "@/lib/site";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_EMAIL } from "@/lib/constants";
import { sendPasswordResetEmail } from "@/lib/email";
import { sha256 } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
const generic = "If that account exists, we’ve sent a password-reset link.";

export async function POST(request: Request) {
  const throttle = await rateLimit(`forgot:${requestIp(request)}`, 4, 60 * 60 * 1000);
  if (!throttle.allowed) return NextResponse.json({ message: generic });
  const parsed = z.object({ email: z.email() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.email.toLowerCase() !== ADMIN_EMAIL) return NextResponse.json({ message: generic });
  const user = await prisma.adminUser.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!user) return NextResponse.json({ message: generic });
  const token = randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.create({ data: { tokenHash: sha256(token), userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  const origin = siteUrl;
  try { await sendPasswordResetEmail(`${origin}/reset-password?token=${encodeURIComponent(token)}`); }
  catch (error) { console.error("Password reset email failed", error); }
  return NextResponse.json({ message: generic });
}
