/**
 * One-off content refresh for an existing database (safe to run more than once):
 *   npm run db:push && npm run content:update
 * Keeps uploaded images, adds new projects and skills, rewrites project copy.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { defaultInstagramUrl, defaultPhotoUrl, newAchievements, profileCopy, projects, quickFactUpdates, skillGroups, toProjectData, volunteerUpdates } from "./portfolio-content";

const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.update({ where: { id: "singleton" }, data: profileCopy });
  await prisma.profile.update({
    where: { id: "singleton" },
    data: { photoUrl: profile.photoUrl || defaultPhotoUrl, instagramUrl: profile.instagramUrl || defaultInstagramUrl },
  });

  for (const fact of quickFactUpdates) {
    await prisma.quickFact.updateMany({ where: { label: fact.fromLabel }, data: { label: fact.label, value: fact.value } });
  }

  for (const project of projects) {
    const titles = [project.title, ...(project.matchTitles ?? [])];
    const existing = await prisma.project.findFirst({ where: { title: { in: titles } } });
    const data = toProjectData(project);
    if (existing) {
      const imageCount = await prisma.projectImage.count({ where: { projectId: existing.id } });
      await prisma.project.update({
        where: { id: existing.id },
        data: { ...data, ...(imageCount === 0 && project.images?.length ? { images: { create: project.images.map((url, order) => ({ url, order })) } } : {}) },
      });
      console.log("Updated", project.title);
    } else {
      await prisma.project.create({ data: { ...data, images: { create: (project.images ?? []).map((url, order) => ({ url, order })) } } });
      console.log("Added", project.title);
    }
  }

  for (const item of newAchievements) {
    if (await prisma.achievement.findFirst({ where: { title: item.title } })) continue;
    await prisma.achievement.updateMany({ data: { order: { increment: 1 } } });
    await prisma.achievement.create({ data: { ...item, order: 0 } });
    console.log("Added achievement", item.title);
  }

  if (await prisma.skillGroup.count() === 0) {
    await prisma.skillGroup.createMany({ data: skillGroups.map((group, order) => ({ label: group.label, itemsJson: JSON.stringify(group.items), order })) });
    console.log("Added skill groups");
  }

  for (const [order, entry] of volunteerUpdates.entries()) {
    const existing = await prisma.volunteerExperience.findFirst({ where: { title: { in: [entry.title, ...(entry.matchTitles ?? [])] }, org: entry.org }, include: { images: true } });
    if (existing) {
      await prisma.volunteerExperience.update({
        where: { id: existing.id },
        data: { title: entry.title, description: entry.description, ...(existing.images.length ? {} : { images: { create: entry.images.map((url, index) => ({ url, order: index })) } }) },
      });
      console.log("Updated volunteer entry", entry.title);
    } else {
      await prisma.volunteerExperience.create({ data: { title: entry.title, org: entry.org, dateLabel: entry.dateLabel, description: entry.description, order, images: { create: entry.images.map((url, index) => ({ url, order: index })) } } });
      console.log("Added volunteer entry", entry.title);
    }
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
