import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { put } from "@vercel/blob";

const safeName = (file: File) => {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${Date.now()}-${randomBytes(4).toString("hex")}-${safe || "upload"}`;
};

/** Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production); public/uploads otherwise (local dev). */
export async function saveUpload(file: File) {
  const name = safeName(file);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return (await put(`uploads/${name}`, file, { access: "public", contentType: file.type })).url;
  }
  if (process.env.VERCEL) throw new Error("Connect Vercel Blob storage to enable uploads.");
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
