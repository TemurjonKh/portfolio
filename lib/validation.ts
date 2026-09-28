import { z } from "zod";

const clean = z.string().trim();
const storedUrl = clean.refine(
  value => value === "" || /^\/(uploads|media)\/[a-zA-Z0-9._-]+$/.test(value) || z.url().safeParse(value).success,
  "Enter a valid URL or upload a file.",
);
const optionalUrl = storedUrl.optional().nullable();
const optionalEmail = z.union([z.literal(""), z.email()]).optional();

export const profileSchema = z.object({
  name: clean.min(2).max(100),
  tagline: clean.min(8).max(220),
  aboutText: clean.min(20).max(3000),
  photoUrl: optionalUrl,
  email: optionalEmail,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  kaggleUrl: optionalUrl,
  resumeUrl: optionalUrl,
});

export const contactSchema = z.object({
  name: clean.min(2, "Enter your name.").max(100),
  email: z.email("Enter a valid email address."),
  message: clean.min(10, "Write at least a sentence.").max(4000),
  website: z.string().max(0).optional(),
});

export const schemas = {
  quickFact: z.object({ label: clean.min(1).max(60), value: clean.min(1).max(160) }),
  education: z.object({
    institution: clean.min(2).max(160),
    degree: clean.min(2).max(180),
    location: clean.max(120).optional().nullable(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    endDateLabel: clean.max(80).optional().nullable(),
    gpa: clean.max(50).optional().nullable(),
    coursework: z.array(clean.min(1).max(120)).max(30),
  }),
  project: z.object({
    title: clean.min(2).max(180),
    role: clean.max(180).optional().nullable(),
    dateLabel: clean.max(80).optional().nullable(),
    stackTags: z.array(clean.min(1).max(50)).max(30),
    description: z.array(clean.min(1).max(800)).max(30),
    githubUrl: optionalUrl,
    demoUrl: optionalUrl,
    status: clean.max(60).optional().nullable(),
    track: z.enum(["games", "ai", "sensing", "systems"]),
    visibility: z.enum(["public", "teaser"]),
    teaser: clean.max(300).optional().nullable(),
    metricLines: z.array(clean.min(3).max(120).refine(line => line.includes("|"), "Write each result as: label | value")).max(8),
    images: z.array(storedUrl.refine(value => value !== "", "Choose an uploaded file or paste a link.")).max(12),
  }),
  skillGroup: z.object({ label: clean.min(2).max(60), items: z.array(clean.min(1).max(60)).min(1).max(20) }),
  certificate: z.object({ title: clean.min(2).max(240), issuer: clean.min(2).max(180), imageUrl: optionalUrl }),
  achievement: z.object({ title: clean.min(2).max(220), description: clean.max(1000).optional().nullable() }),
  volunteer: z.object({
    title: clean.min(2).max(180),
    org: clean.max(160).optional().nullable(),
    dateLabel: clean.max(80).optional().nullable(),
    description: clean.max(1500).optional().nullable(),
    images: z.array(storedUrl.refine(value => value !== "", "Choose an uploaded image.")).max(12),
  }),
  activity: z.object({
    title: clean.min(2).max(180),
    org: clean.max(160).optional().nullable(),
    location: clean.max(120).optional().nullable(),
    dateLabel: clean.max(80).optional().nullable(),
    description: clean.max(1500).optional().nullable(),
    images: z.array(storedUrl.refine(value => value !== "", "Choose an uploaded image.")).max(12),
  }),
  interest: z.object({ label: clean.min(1).max(100), imageUrl: optionalUrl }),
  language: z.object({ name: clean.min(2).max(80), level: clean.min(2).max(120) }),
  attachment: z.object({ label: clean.min(2).max(180), fileUrl: optionalUrl, category: clean.min(2).max(80) }),
};

export type ResourceType = keyof typeof schemas;
