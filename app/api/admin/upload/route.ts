import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { saveUpload } from "@/lib/storage";

export const runtime = "nodejs";

const MB = 1024 * 1024;
const limits: Record<string, number> = {
  "image/jpeg": 10 * MB,
  "image/png": 10 * MB,
  "image/webp": 10 * MB,
  "image/avif": 10 * MB,
  "application/pdf": 10 * MB,
  "video/mp4": 40 * MB,
  "video/webm": 40 * MB,
};

export async function POST(request: Request) {
  if (!await requireAdminApi()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Choose an image, video, or PDF to upload." }, { status: 400 });
  const limit = limits[file.type];
  if (!limit) return NextResponse.json({ error: "Use a JPG, PNG, WebP, AVIF, MP4, WebM, or PDF file." }, { status: 400 });
  if (file.size > limit) return NextResponse.json({ error: `That file is larger than ${limit / MB} MB. For longer videos, upload to YouTube and paste the link instead.` }, { status: 400 });
  try { return NextResponse.json({ url: await saveUpload(file), type: file.type }); }
  catch (error) { console.error("Upload failed", error); return NextResponse.json({ error: error instanceof Error && error.message.startsWith("Connect") ? error.message : "The upload didn’t finish. Please try again." }, { status: 500 }); }
}
