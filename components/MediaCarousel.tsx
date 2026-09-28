"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { youtubeId, type MediaKind } from "@/lib/media";

type Media = { id: string; url: string; alt: string | null; kind: MediaKind };

function Slide({ item, label, onRatio }: { item: Media; label: string; onRatio: (ratio: number) => void }) {
  if (item.kind === "youtube") {
    return (
      <iframe
        className="tk-media__embed"
        src={`https://www.youtube-nocookie.com/embed/${youtubeId(item.url)}?rel=0`}
        title={label}
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (item.kind === "video") {
    return (
      <video
        className="tk-media__video"
        src={item.url}
        controls
        muted
        playsInline
        preload="metadata"
        aria-label={label}
        onLoadedMetadata={event => {
          const video = event.currentTarget;
          if (video.videoWidth && video.videoHeight) onRatio(video.videoWidth / video.videoHeight);
        }}
      />
    );
  }
  return (
    <>
      <Image src={item.url} alt="" aria-hidden="true" fill sizes="(max-width: 900px) 100vw, 44vw" className="tk-media__backdrop" />
      <Image
        src={item.url}
        alt={item.alt || label}
        fill
        sizes="(max-width: 900px) 100vw, 44vw"
        className="tk-media__image"
        onLoad={event => {
          const image = event.currentTarget;
          if (image.naturalWidth && image.naturalHeight) onRatio(image.naturalWidth / image.naturalHeight);
        }}
      />
    </>
  );
}

/** Renders nothing when there is no media, so rows without pictures take no extra space. */
export function MediaCarousel({ title, items }: { title: string; items: Media[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const reducedMotion = useReducedMotion();
  const active = items[Math.min(current, items.length - 1)];

  useEffect(() => setCurrent(index => Math.min(index, Math.max(items.length - 1, 0))), [items.length]);
  useEffect(() => {
    // Only still images auto-advance; a video stays put so nobody is cut off mid-play.
    if (items.length < 2 || !inView || paused || reducedMotion || active?.kind !== "image") return;
    const timer = window.setTimeout(() => setCurrent(index => (index + 1) % items.length), 4800);
    return () => window.clearTimeout(timer);
  }, [active, inView, items.length, paused, reducedMotion]);

  if (!active) return null;
  const select = (index: number) => { setCurrent((index + items.length) % items.length); setPaused(true); };
  const label = `${title}, ${active.kind === "image" ? "image" : "video"} ${current + 1} of ${items.length}`;
  const ratio = active.kind === "youtube" ? 16 / 9 : ratios[active.id] || 1.6;

  return (
    <div
      ref={rootRef}
      className="tk-media"
      role="region"
      aria-roledescription="carousel"
      aria-label={title + " media"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
    >
      <div className="tk-media__frame" style={{ aspectRatio: Math.min(Math.max(ratio, 0.6), 2.4) }}>
        <Slide key={active.id} item={active} label={label} onRatio={value => setRatios(previous => ({ ...previous, [active.id]: value }))} />
      </div>
      {items.length > 1 && (
        <div className="tk-media__controls">
          <button type="button" onClick={() => select(current - 1)} aria-label="Previous">‹</button>
          <div>
            {items.map((item, index) => (
              <button
                type="button"
                key={item.id}
                onClick={() => select(index)}
                aria-label={`Show ${item.kind === "image" ? "image" : "video"} ${index + 1}`}
                aria-current={index === current}
                className={(index === current ? "is-active " : "") + (item.kind !== "image" ? "is-video" : "")}
              />
            ))}
          </div>
          <button type="button" onClick={() => select(current + 1)} aria-label="Next">›</button>
        </div>
      )}
    </div>
  );
}
