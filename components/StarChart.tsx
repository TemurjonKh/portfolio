"use client";

import { useState } from "react";
import { normalizeTrack, TRACKS, type TrackId } from "@/lib/media";

export type ChartProject = { id: string; title: string; track: string; visibility: string; status: string | null };

// Constellations climb from the lower left (systems) to the upper right (games),
// and the dashed course keeps going toward where the work is heading.
const CLUSTERS: Record<TrackId, { x: number; y: number; labelX: number; labelY: number }> = {
  systems: { x: 96, y: 378, labelX: 96, labelY: 440 },
  sensing: { x: 222, y: 270, labelX: 318, labelY: 352 },
  ai: { x: 352, y: 176, labelX: 404, labelY: 214 },
  games: { x: 462, y: 100, labelX: 520, labelY: 168 },
};
// Spread across the course rather than along it, so each group reads as a constellation.
const OFFSETS = [[0, 0], [46, 40], [-22, -50], [62, -16], [-50, 18], [18, 62], [80, 30], [-60, -28]];
const COURSE = "M 20 456 C 90 410, 160 330, 222 270 S 320 200, 352 176 S 430 120, 462 100 S 510 50, 532 30";

function positionOf(track: string, index: number) {
  const cluster = CLUSTERS[normalizeTrack(track)];
  const [dx, dy] = OFFSETS[index % OFFSETS.length];
  return { x: cluster.x + dx, y: cluster.y + dy };
}

export function StarChart({ projects, onSelect }: { projects: ChartProject[]; onSelect: (project: ChartProject) => void }) {
  const [active, setActive] = useState<string | null>(null);

  const placed = TRACKS.flatMap(track => projects
    .filter(project => normalizeTrack(project.track) === track.id)
    .map((project, index) => ({ project, ...positionOf(track.id, index) })));

  const activeStar = placed.find(star => star.project.id === active);

  return (
    <figure className="tk-chart">
      <svg viewBox="0 0 560 470" role="group" aria-label="Project star chart">
        <defs>
          <radialGradient id="tk-star-glow">
            <stop offset="0%" stopColor="var(--sun)" stopOpacity=".55" />
            <stop offset="100%" stopColor="var(--sun)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="tk-chart__grid" aria-hidden="true">
          {[110, 220, 330].map(radius => <circle key={radius} cx="96" cy="378" r={radius} />)}
        </g>

        <path d={COURSE} className="tk-chart__course" aria-hidden="true" />
        <g className="tk-chart__destination" aria-hidden="true">
          <circle cx="532" cy="30" r="9" />
          <circle cx="532" cy="30" r="2.5" />
          <text x="516" y="34" textAnchor="end">game AI research</text>
        </g>

        {TRACKS.map(track => {
          const stars = placed.filter(star => normalizeTrack(star.project.track) === track.id);
          if (!stars.length) return null;
          const cluster = CLUSTERS[track.id];
          return (
            <g key={track.id}>
              <polyline className="tk-chart__line" points={stars.map(star => `${star.x},${star.y}`).join(" ")} aria-hidden="true" />
              <text className="tk-chart__track" x={cluster.labelX} y={cluster.labelY} textAnchor="middle" aria-hidden="true">{track.label}</text>
            </g>
          );
        })}

        {placed.map(({ project, x, y }, index) => {
          const forming = project.visibility === "teaser";
          return (
            <a
              key={project.id}
              href={"#project-" + project.id}
              className={"tk-chart__star" + (forming ? " is-forming" : "") + (active === project.id ? " is-active" : "")}
              style={{ animationDelay: 120 + index * 90 + "ms" }}
              aria-label={project.title + (forming ? " (in development)" : "")}
              onMouseEnter={() => setActive(project.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(project.id)}
              onBlur={() => setActive(null)}
              onClick={event => { event.preventDefault(); onSelect(project); }}
            >
              <circle cx={x} cy={y} r="22" className="tk-chart__hit" />
              {!forming && <circle cx={x} cy={y} r="16" fill="url(#tk-star-glow)" />}
              <circle cx={x} cy={y} r={forming ? 6 : 4.5} className="tk-chart__core" />
            </a>
          );
        })}

        {activeStar && (
          <text
            className="tk-chart__label"
            x={Math.min(Math.max(activeStar.x, 90), 470)}
            y={activeStar.y - 26}
            textAnchor="middle"
          >
            {activeStar.project.title.length > 42 ? activeStar.project.title.slice(0, 40) + "…" : activeStar.project.title}
          </text>
        )}
      </svg>
      <figcaption>
        <span><i className="tk-key tk-key--lit" aria-hidden="true" />Finished</span>
        <span><i className="tk-key tk-key--forming" aria-hidden="true" />In development</span>
        <span className="tk-chart__hint">Select a star to open the project.</span>
      </figcaption>
    </figure>
  );
}
