import { prisma } from "@/lib/prisma";
import { mediaKind, normalizeTrack } from "@/lib/media";

export const parseList = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

const parseMetric = (line: string) => {
  const [label, ...rest] = line.split("|");
  const value = rest.join("|").trim();
  return value ? { label: label.trim(), value } : null;
};

type MediaRow = { id: string; url: string; alt: string | null };
const withKind = (images: MediaRow[]) => images.map(image => ({ id: image.id, url: image.url, alt: image.alt, kind: mediaKind(image.url) }));

/**
 * publicView strips the private fields of teaser projects before they reach the browser.
 * Anything passed to a client component ends up in the page source, so hiding it with CSS is not enough.
 */
export async function getPortfolioContent({ publicView = false }: { publicView?: boolean } = {}) {
  const [profile, education, projects, skillGroups, certificates, achievements, volunteers, activities, interests, languages, attachments] = await Promise.all([
    prisma.profile.findUnique({ where: { id: "singleton" }, include: { quickFacts: { orderBy: { order: "asc" } } } }),
    prisma.educationEntry.findMany({ orderBy: { order: "asc" } }),
    prisma.project.findMany({ orderBy: { order: "asc" }, include: { images: { orderBy: { order: "asc" } } } }),
    prisma.skillGroup.findMany({ orderBy: { order: "asc" } }),
    prisma.certificate.findMany({ orderBy: { order: "asc" } }),
    prisma.achievement.findMany({ orderBy: { order: "asc" } }),
    prisma.volunteerExperience.findMany({ orderBy: { order: "asc" }, include: { images: { orderBy: { order: "asc" } } } }),
    prisma.activity.findMany({ orderBy: { order: "asc" }, include: { images: { orderBy: { order: "asc" } } } }),
    prisma.interest.findMany({ orderBy: { order: "asc" } }),
    prisma.language.findMany({ orderBy: { order: "asc" } }),
    prisma.attachment.findMany({ orderBy: { order: "asc" } }),
  ]);

  return {
    profile,
    education: education.map(entry => ({ ...entry, coursework: parseList(entry.courseworkJson) })),
    projects: projects.map(project => {
      const images = withKind(project.images.length
        ? project.images
        : project.imageUrl ? [{ id: "legacy-" + project.id, url: project.imageUrl, alt: null }] : []);
      const metricLines = parseList(project.metricsJson);
      const full = {
        id: project.id,
        title: project.title,
        role: project.role,
        dateLabel: project.dateLabel,
        status: project.status,
        track: normalizeTrack(project.track),
        visibility: project.visibility,
        teaser: project.teaser,
        images,
        stackTags: parseList(project.stackTagsJson),
        description: parseList(project.descriptionJson),
        metricLines,
        metrics: metricLines.map(parseMetric).filter((metric): metric is { label: string; value: string } => Boolean(metric)),
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl,
      };
      if (!publicView || project.visibility !== "teaser") return full;
      return { ...full, role: null, stackTags: [], description: [], metricLines: [], metrics: [], githubUrl: null, demoUrl: null };
    }),
    skillGroups: skillGroups.map(group => ({ id: group.id, label: group.label, items: parseList(group.itemsJson) })),
    certificates,
    achievements,
    volunteers: volunteers.map(entry => ({ ...entry, images: withKind(entry.images) })),
    activities: activities.map(entry => ({ ...entry, images: withKind(entry.images) })),
    interests,
    languages,
    attachments: publicView ? attachments.filter(item => item.fileUrl) : attachments,
  };
}

export type PortfolioContent = Awaited<ReturnType<typeof getPortfolioContent>>;
export type PortfolioProject = PortfolioContent["projects"][number];
export type MediaItem = PortfolioProject["images"][number];
