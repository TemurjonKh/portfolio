/**
 * All site content lives here and in lib/portfolio-data.ts.
 * Edit these files, commit, and push: Vercel redeploys the site.
 */
import { mediaKind, normalizeTrack } from "@/lib/media";
import { defaultInstagramUrl, defaultPhotoUrl, newAchievements, profileCopy, projects, skillGroups, volunteerUpdates } from "@/lib/portfolio-data";

const media = (urls: string[] = [], prefix: string) => urls.map((url, i) => ({ id: prefix + i, url, alt: null as string | null, kind: mediaKind(url) }));
const withIds = <T extends object>(prefix: string, items: T[]) => items.map((item, i) => ({ id: prefix + i, ...item }));

export const portfolioContent = {
  profile: {
    name: "Temurjon Kholmirzaev",
    ...profileCopy,
    photoUrl: defaultPhotoUrl as string | null,
    email: "kholmirzaevtemurjon@gmail.com",
    githubUrl: "https://github.com/TemurjonKh" as string | null,
    linkedinUrl: "https://www.linkedin.com/in/temurjon-kholmirzaev-461052374" as string | null,
    instagramUrl: defaultInstagramUrl as string | null,
    // Put a PDF in public/ and set this to "/resume.pdf" to show the Resume buttons.
    resumeUrl: null as string | null,
    quickFacts: withIds("fact", [
      { label: "GPA", value: "4.31 / 4.5" },
      { label: "Languages", value: "Uzbek · Korean · English" },
      { label: "Graduate targets", value: "KAIST · SNU" },
      { label: "Heading toward", value: "Game AI research" },
    ]),
  },
  education: withIds("edu", [{
    institution: "Inha University",
    degree: "B.S. Integrated Systems Engineering",
    location: "Incheon, South Korea" as string | null,
    startDate: "2023-09-01",
    endDate: "2027-08-01" as string | null,
    endDateLabel: "Aug 2027 (expected)" as string | null,
    gpa: "4.31/4.5" as string | null,
    coursework: ["Database Systems", "Digital Image Processing", "Introduction to AI Applications"],
  }]),
  projects: [...projects].sort((a, b) => a.order - b.order).map((p, i) => {
    // Teaser projects show only title, status, teaser line and media.
    const teaser = p.visibility === "teaser";
    return {
      id: "project" + i,
      title: p.title,
      role: teaser ? null : p.role ?? null,
      dateLabel: p.dateLabel ?? null,
      status: p.status ?? null,
      track: normalizeTrack(p.track),
      visibility: p.visibility,
      teaser: p.teaser ?? null,
      images: media(p.images, "project" + i + "-"),
      stackTags: teaser ? [] : p.stackTags,
      description: teaser ? [] : p.description,
      metrics: teaser ? [] : p.metrics.map(line => {
        const [label, ...rest] = line.split("|");
        return { label: label.trim(), value: rest.join("|").trim() };
      }),
      githubUrl: teaser ? null : p.githubUrl ?? null,
      demoUrl: teaser ? null : p.demoUrl ?? null,
    };
  }),
  skillGroups: withIds("skill", skillGroups),
  certificates: withIds("cert", [
    { title: "Machine Learning (Supervised & Unsupervised Learning, Reinforcement Learning)", issuer: "DeepLearning.AI & Stanford", imageUrl: null as string | null },
    { title: "Machine Learning Explainability (SHAP values, Feature Importance)", issuer: "Kaggle", imageUrl: null as string | null },
    { title: "Problem Solving (Basic, Python)", issuer: "HackerRank", imageUrl: null as string | null },
    { title: "AI Specialist Level 1 (인공지능(AI) 전문가 1급)", issuer: "한국어자격증협회 (Korea Certification Association)", imageUrl: null as string | null },
  ]),
  achievements: withIds("award", [
    ...newAchievements,
    { title: "Samsung Global Hope Scholarship recipient", description: "Full scholarship for academic excellence and leadership" },
    { title: "Global Scholarship for Academic Excellence", description: "Inha University" },
    { title: "INHA & IUT Math & Physics Competition", description: "Winner" },
    { title: "District Physics Olympiad", description: "Runner-up" },
  ] as { title: string; description: string | null }[]),
  volunteers: volunteerUpdates.map((v, i) => ({ id: "vol" + i, title: v.title, org: v.org as string | null, dateLabel: v.dateLabel as string | null, description: v.description as string | null, images: media(v.images, "vol" + i + "-") })),
  activities: withIds("act", [
    { title: "Samsung Foundation Scholar", org: "Samsung Foundation" as string | null, location: "Seoul, South Korea" as string | null, dateLabel: "Sep 2023 – present" as string | null, description: "Intercultural exchange programs, leadership camps, Samsung-sponsored events, global scholar network, and volunteering." as string | null, images: media([], "act0-") },
    { title: "CO-WEEK Academy Participant", org: null, location: "PyeongChang, South Korea", dateLabel: "Jun 30 – Jul 4, 2025", description: "Nationwide interdisciplinary technology education program and AI/data systems workshops.", images: media([], "act1-") },
  ]),
  interests: withIds("interest", [{ label: "Formula 1", imageUrl: null as string | null }, { label: "Football", imageUrl: null as string | null }]),
  languages: withIds("lang", [{ name: "English", level: "IELTS 6.0" }, { name: "Korean", level: "TOPIK Level 5" }, { name: "Uzbek", level: "Native" }]),
  attachments: [] as { id: string; label: string; fileUrl: string | null }[],
};

export type PortfolioContent = typeof portfolioContent;
export type PortfolioProject = PortfolioContent["projects"][number];
export type MediaItem = PortfolioProject["images"][number];
