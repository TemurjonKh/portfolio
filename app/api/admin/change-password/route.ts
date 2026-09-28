import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi, invalidateAllSessions, createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const parsed = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(12).max(200) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Your new password must have at least 12 characters." }, { status: 400 });
  if (!await bcrypt.compare(parsed.data.currentPassword, session.user.passwordHash)) return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.adminUser.update({ where: { id: session.userId }, data: { passwordHash } });
  await invalidateAllSessions(session.userId);
  await createSession(session.userId);
  return NextResponse.json({ ok: true });
}
