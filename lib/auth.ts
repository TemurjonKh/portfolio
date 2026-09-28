import "server-only";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/constants";

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { tokenHash: sha256(token), userId, expiresAt } });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: expiresAt, path: "/" });
}

export async function getAdminSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return prisma.session.findFirst({ where: { tokenHash: sha256(token), expiresAt: { gt: new Date() } }, include: { user: true } });
}

export async function requireAdmin(returnTo = "/admin") {
  const session = await getAdminSession();
  if (!session) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  return session;
}

export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}

export async function destroyCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  store.delete(SESSION_COOKIE);
}

export async function invalidateAllSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

export { sha256 };
