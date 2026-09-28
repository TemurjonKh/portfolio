import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { defaultInstagramUrl, defaultPhotoUrl, newAchievements, profileCopy, projects, skillGroups, toProjectData, volunteerUpdates } from "./portfolio-content";

const prisma = new PrismaClient();
const ADMIN_EMAIL = "kholmirzaevtemurjon@gmail.com";

const json = (values: string[]) => JSON.stringify(values);

async function main() {
  // Safe to run on every deploy: nothing below overwrites existing rows.
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!await prisma.adminUser.findUnique({ where: { email: ADMIN_EMAIL } })) {
    if (!password || password.length < 12) throw new Error("ADMIN_INITIAL_PASSWORD (12+ characters) is needed to create the owner account.");
    await prisma.adminUser.create({ data: { email: ADMIN_EMAIL, passwordHash: await bcrypt.hash(password, 12) } });
  }

  await prisma.profile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: "Temurjon Kholmirzaev",
      ...profileCopy,
      photoUrl: defaultPhotoUrl,
      email: ADMIN_EMAIL,
      githubUrl: "https://github.com/TemurjonKh",
      linkedinUrl: "https://www.linkedin.com/in/temurjon-kholmirzaev-461052374",
      instagramUrl: defaultInstagramUrl,
      quickFacts: { create: [
        { label: "GPA", value: "4.31 / 4.5", order: 0 },
        { label: "Languages", value: "Uzbek · Korean · English", order: 1 },
        { label: "Graduate targets", value: "KAIST · SNU", order: 2 },
        { label: "Heading toward", value: "Game AI research", order: 3 },
      ] },
    },
  });

  if (await prisma.educationEntry.count() === 0) await prisma.educationEntry.create({ data: {
    institution: "Inha University", degree: "B.S. Integrated Systems Engineering", location: "Incheon, South Korea",
    startDate: new Date("2023-09-01"), endDate: new Date("2027-08-01"), endDateLabel: "Aug 2027 (expected)", gpa: "4.31/4.5",
    courseworkJson: json(["Database Systems", "Digital Image Processing", "Introduction to AI Applications"]), order: 0,
  }});

  if (await prisma.project.count() === 0) {
    for (const project of projects) {
      await prisma.project.create({ data: { ...toProjectData(project), images: { create: (project.images ?? []).map((url, order) => ({ url, order })) } } });
    }
  }

  if (await prisma.skillGroup.count() === 0) await prisma.skillGroup.createMany({ data: skillGroups.map((group, order) => ({ label: group.label, itemsJson: json(group.items), order })) });

  if (await prisma.volunteerExperience.count() === 0) {
    for (const [order, entry] of volunteerUpdates.entries()) {
      await prisma.volunteerExperience.create({ data: { title: entry.title, org: entry.org, dateLabel: entry.dateLabel, description: entry.description, order, images: { create: entry.images.map((url, index) => ({ url, order: index })) } } });
    }
  }

  if (await prisma.certificate.count() === 0) await prisma.certificate.createMany({ data: [
    { title: "Machine Learning (Supervised & Unsupervised Learning, Reinforcement Learning)", issuer: "DeepLearning.AI & Stanford", order: 0 },
    { title: "Machine Learning Explainability (SHAP values, Feature Importance)", issuer: "Kaggle", order: 1 },
    { title: "Problem Solving (Basic, Python)", issuer: "HackerRank", order: 2 },
    { title: "AI Specialist Level 1 (인공지능(AI) 전문가 1급)", issuer: "한국어자격증협회 (Korea Certification Association)", order: 3 },
  ]});

  if (await prisma.achievement.count() === 0) await prisma.achievement.createMany({ data: [
    ...newAchievements,
    { title: "Samsung Global Hope Scholarship recipient", description: "Full scholarship for academic excellence and leadership" },
    { title: "Global Scholarship for Academic Excellence", description: "Inha University" },
    { title: "INHA & IUT Math & Physics Competition", description: "Winner" },
    { title: "District Physics Olympiad", description: "Runner-up" },
  ].map((item, order) => ({ ...item, order })) });

  if (await prisma.activity.count() === 0) await prisma.activity.createMany({ data: [
    { title: "Samsung Foundation Scholar", org: "Samsung Foundation", location: "Seoul, South Korea", dateLabel: "Sep 2023 – present", description: "Intercultural exchange programs, leadership camps, Samsung-sponsored events, global scholar network, and volunteering.", order: 0 },
    { title: "CO-WEEK Academy Participant", location: "PyeongChang, South Korea", dateLabel: "Jun 30 – Jul 4, 2025", description: "Nationwide interdisciplinary technology education program and AI/data systems workshops.", order: 1 },
  ]});

  if (await prisma.interest.count() === 0) await prisma.interest.createMany({ data: [
    { label: "Formula 1", order: 0 },
    { label: "Football", order: 1 },
  ]});

  if (await prisma.language.count() === 0) await prisma.language.createMany({ data: [
    { name: "English", level: "IELTS 6.0", order: 0 }, { name: "Korean", level: "TOPIK Level 5", order: 1 }, { name: "Uzbek", level: "Native", order: 2 },
  ]});

  if (await prisma.attachment.count() === 0) await prisma.attachment.createMany({ data: [
    { label: "Research Journal", category: "research-journal", order: 0 },
    { label: "Extended Portfolio", category: "portfolio", order: 1 },
    { label: "Additional Certificates", category: "certificate", order: 2 },
  ]});
}

main().finally(() => prisma.$disconnect());
