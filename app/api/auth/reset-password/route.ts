import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sha256 } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = z.object({ token: z.string().min(20), password: z.string().min(12).max(200) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Use a password with at least 12 characters." }, { status: 400 });
  const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(parsed.data.token) } });
  if (!reset || reset.usedAt || reset.expiresAt <= new Date()) return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.adminUser.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.updateMany({ where: { userId: reset.userId, usedAt: null, id: { not: reset.id } }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: reset.userId } }),
  ]);
  return NextResponse.json({ ok: true });
}
