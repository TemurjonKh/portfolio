export type MediaKind = "image" | "video" | "youtube";

export const TRACKS = [
  { id: "games", label: "Games", blurb: "Worlds with opponents worth outsmarting." },
  { id: "ai", label: "AI & agents", blurb: "Models that learn by playing against themselves." },
  { id: "sensing", label: "Sensing & hardware", blurb: "Cameras, signals, and small computers reading the real world." },
  { id: "systems", label: "Systems & data", blurb: "The databases and back ends that keep information straight." },
] as const;

export type TrackId = (typeof TRACKS)[number]["id"];

// Older databases used three tracks; map them onto the current four.
const LEGACY: Record<string, TrackId> = { agents: "ai", perception: "sensing" };

export function normalizeTrack(id: string): TrackId {
  if (TRACKS.some(track => track.id === id)) return id as TrackId;
  return LEGACY[id] ?? "systems";
}

export function trackLabel(id: string) {
  return TRACKS.find(track => track.id === normalizeTrack(id))!.label;
}

export function youtubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export function mediaKind(url: string): MediaKind {
  if (youtubeId(url)) return "youtube";
  if (/\.(mp4|webm)(\?.*)?$/i.test(url)) return "video";
  return "image";
}
