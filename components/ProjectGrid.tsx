"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PiArrowUpRight, PiGithubLogo, PiX } from "react-icons/pi";
import { MediaCarousel } from "@/components/MediaCarousel";
import { normalizeTrack, trackLabel, TRACKS, youtubeId, type TrackId } from "@/lib/media";
import type { PortfolioProject } from "@/lib/content";

/** Deterministic pseudo-random numbers from a string, so a project's cover never changes between renders. */
function seeded(text: string) {
  let h = 2166136261;
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 10000) / 10000;
}

/** A small generated constellation, used when a project has no picture yet. */
function ConstellationCover({ project }: { project: PortfolioProject }) {
  const random = seeded(project.title);
  const stars = Array.from({ length: 6 }, (_, i) => ({ x: 40 + (i / 5) * 240 + (random() - 0.5) * 50, y: 40 + random() * 120, r: 1.8 + random() * 2.4 }));
  const dust = Array.from({ length: 36 }, () => ({ x: random() * 320, y: random() * 200, r: 0.4 + random() * 0.8, o: 0.2 + random() * 0.5 }));
  const forming = project.visibility === "teaser";
  return (
    <svg className={"tk-cover tk-cover--" + normalizeTrack(project.track)} viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {dust.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#eceff6" opacity={d.o} />)}
      <polyline points={stars.map(s => `${s.x},${s.y}`).join(" ")} className="tk-cover__line" />
      {stars.map((s, i) => (
        <g key={i}>
          {!forming && <circle cx={s.x} cy={s.y} r={s.r * 4} className="tk-cover__glow" />}
          <circle cx={s.x} cy={s.y} r={s.r} className={forming ? "tk-cover__star is-forming" : "tk-cover__star"} />
        </g>
      ))}
    </svg>
  );
}

function Cover({ project, sizes }: { project: PortfolioProject; sizes: string }) {
  const first = project.images[0];
  // Blurred copy behind, full image in front, so screenshots and portrait photos are never cropped.
  if (first?.kind === "image") return (
    <>
      <Image src={first.url} alt="" fill sizes={sizes} className="tk-card__img tk-card__img--backdrop" />
      <Image src={first.url} alt="" fill sizes={sizes} className="tk-card__img tk-card__img--fit" />
    </>
  );
  if (first?.kind === "video") return <video src={first.url + "#t=0.5"} muted playsInline preload="metadata" className="tk-card__img" aria-hidden="true" />;
  if (first?.kind === "youtube") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`https://i.ytimg.com/vi/${youtubeId(first.url)}/hqdefault.jpg`} alt="" className="tk-card__img" loading="lazy" />;
  }
  return <ConstellationCover project={project} />;
}

function ProjectDetail({ project }: { project: PortfolioProject }) {
  const teaser = project.visibility === "teaser";
  return (
    <div className={"tk-detail" + (project.images.length ? " tk-detail--media" : "")}>
      <div>
        <p className="tk-meta">
          <span>{trackLabel(project.track)}</span>
          {project.status && <span className="tk-status">{project.status}</span>}
        </p>
        <h3 id="tk-dialog-title">{project.title}</h3>
        {(project.role || project.dateLabel) && <p className="tk-project__context">{[project.role, project.dateLabel].filter(Boolean).join(" · ")}</p>}
        {teaser ? (
          <>
            {project.teaser && <p className="tk-project__teaser">{project.teaser}</p>}
            <div className="tk-redacted" aria-hidden="true"><i /><i /><i /></div>
            <p className="tk-project__note">Full details go public when it launches.</p>
          </>
        ) : (
          <>
            {project.metrics.length > 0 && (
              <dl className="tk-metrics">
                {project.metrics.map(metric => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
              </dl>
            )}
            {project.description.length > 0 && <ul className="tk-project__points">{project.description.map(point => <li key={point}>{point}</li>)}</ul>}
            {project.stackTags.length > 0 && <ul className="tk-tags" aria-label="Tools">{project.stackTags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
            {(project.githubUrl || project.demoUrl) && (
              <p className="tk-project__links">
                {project.demoUrl && <a className="tk-button tk-button--solid" href={project.demoUrl} target="_blank" rel="noreferrer">Live demo <PiArrowUpRight aria-hidden="true" /></a>}
                {project.githubUrl && <a className="tk-button" href={project.githubUrl} target="_blank" rel="noreferrer"><PiGithubLogo aria-hidden="true" />Source code</a>}
              </p>
            )}
          </>
        )}
      </div>
      <MediaCarousel title={project.title} items={project.images} />
    </div>
  );
}

function Row({ project, onOpen }: { project: PortfolioProject; onOpen: () => void }) {
  const teaser = project.visibility === "teaser";
  const summary = project.teaser || project.description[0];
  const reduce = useReducedMotion();
  return (
    <motion.li
      className={"tk-row" + (teaser ? " tk-row--teaser" : "")}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="tk-row__text">
        <p className="tk-meta">
          <span>{trackLabel(project.track)}</span>
          {project.status && <span className={"tk-status" + (/place|winner|award/i.test(project.status) ? " tk-status--award" : "")}>{project.status}</span>}
          {project.dateLabel && <span>{project.dateLabel}</span>}
        </p>
        <h3>
          <button type="button" className="tk-row__title" onClick={onOpen} aria-haspopup="dialog">{project.title}</button>
        </h3>
        {summary && <p className="tk-row__summary">{summary}</p>}
        {project.metrics.length > 0 && (
          <dl className="tk-row__metrics">
            {project.metrics.slice(0, 3).map(metric => <div key={metric.label}><dd>{metric.value}</dd><dt>{metric.label}</dt></div>)}
          </dl>
        )}
        {project.stackTags.length > 0 && <ul className="tk-tags tk-tags--quiet" aria-label="Tools">{project.stackTags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
        <p className="tk-row__actions">
          <button type="button" className="tk-button" onClick={onOpen} aria-haspopup="dialog">{teaser ? "Preview" : "Read more"}</button>
          {project.demoUrl && <a className="tk-button tk-button--quiet" href={project.demoUrl} target="_blank" rel="noreferrer">Live site<PiArrowUpRight aria-hidden="true" /></a>}
          {project.githubUrl && <a className="tk-button tk-button--quiet" href={project.githubUrl} target="_blank" rel="noreferrer"><PiGithubLogo aria-hidden="true" />Code</a>}
        </p>
      </div>
      <button type="button" className="tk-row__media" onClick={onOpen} tabIndex={-1} aria-hidden="true">
        <Cover project={project} sizes="(max-width: 800px) 100vw, 560px" />
      </button>
    </motion.li>
  );
}

export function ProjectGrid({ projects, openId, onOpenChange }: { projects: PortfolioProject[]; openId: string | null; onOpenChange: (id: string | null) => void }) {
  const [filter, setFilter] = useState<TrackId | "all">("all");
  const open = projects.find(project => project.id === openId) ?? null;
  const ref = useRef<HTMLDialogElement>(null);
  const tracks = TRACKS.filter(track => projects.some(project => normalizeTrack(project.track) === track.id));
  const shown = useMemo(() => projects.filter(project => filter === "all" || normalizeTrack(project.track) === filter), [projects, filter]);

  // Native <dialog> gives focus trapping, Escape, the top layer and focus restore for free.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <>
      {tracks.length > 1 && (
        <div className="tk-filters" role="group" aria-label="Filter projects by type">
          {[{ id: "all" as const, label: "All" }, ...tracks].map(track => {
            const count = track.id === "all" ? projects.length : projects.filter(project => normalizeTrack(project.track) === track.id).length;
            return (
              <button key={track.id} type="button" aria-pressed={filter === track.id} onClick={() => setFilter(track.id)}>
                {track.label}<span>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <ol className="tk-rows">
        {shown.map(project => <Row key={project.id + filter} project={project} onOpen={() => onOpenChange(project.id)} />)}
      </ol>

      <dialog
        ref={ref}
        className="tk-dialog"
        aria-labelledby="tk-dialog-title"
        onClose={() => onOpenChange(null)}
        onMouseDown={event => event.target === event.currentTarget && onOpenChange(null)}
      >
        {open && (
          <div className="tk-dialog__panel">
            <button type="button" className="tk-dialog__close" onClick={() => onOpenChange(null)} aria-label="Close project"><PiX /></button>
            <ProjectDetail project={open} />
          </div>
        )}
      </dialog>
    </>
  );
}
