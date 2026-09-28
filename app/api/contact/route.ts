import { NextResponse } from "next/server";
import { emailConfigured, sendContactEmail } from "@/lib/email";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the form and try again." }, { status: 400 });
  // Bots fill the hidden "website" field; pretend success so they don't retry.
  if (parsed.data.website) return NextResponse.json({ ok: true });
  if (!emailConfigured()) return NextResponse.json({ error: "The message form isn’t connected yet. Use the email link instead." }, { status: 503 });

  const limit = await rateLimit("contact:" + requestIp(request), 3, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many messages from this network. Try again in an hour, or use the email link." }, { status: 429 });

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "The message didn’t send. Use the email link instead." }, { status: 502 });
  }
}
