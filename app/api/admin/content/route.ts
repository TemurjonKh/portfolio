import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema, schemas, type ResourceType } from "@/lib/validation";

export const runtime = "nodejs";

const nullable = (value: unknown) => value === "" || value === undefined ? null : value;

export async function POST(request: Request) {
  if (!await requireAdminApi()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const body = await request.json().catch(() => null) as { action?: string; type?: string; id?: string; data?: unknown; ids?: unknown } | null;
  if (!body) return NextResponse.json({ error: "The request could not be read." }, { status: 400 });

  if (body.type === "profile" && body.action === "update") {
    const parsed = profileSchema.safeParse(body.data);
    if (!parsed.success) return invalid(parsed.error.issues[0]?.message);
    const data = parsed.data;
    const profile = await prisma.profile.update({
      where: { id: "singleton" },
      data: {
        name: data.name,
        tagline: data.tagline,
        aboutText: data.aboutText,
        photoUrl: nullable(data.photoUrl) as string | null,
        email: data.email || "",
        githubUrl: nullable(data.githubUrl) as string | null,
        linkedinUrl: nullable(data.linkedinUrl) as string | null,
        instagramUrl: nullable(data.instagramUrl) as string | null,
        kaggleUrl: nullable(data.kaggleUrl) as string | null,
        resumeUrl: nullable(data.resumeUrl) as string | null,
      },
    });
    return NextResponse.json(profile);
  }

  if (!(body.type && body.type in schemas)) return invalid("Choose a valid section.");
  const type = body.type as ResourceType;

  if (body.action === "reorder") {
    const parsed = z.array(z.string().min(1)).max(100).safeParse(body.ids);
    if (!parsed.success) return invalid("The new order could not be saved.");
    await reorder(type, parsed.data);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "delete") {
    if (!body.id) return invalid("Choose an item to delete.");
    await remove(type, body.id);
    return NextResponse.json({ ok: true });
  }

  const parsed = schemas[type].safeParse(body.data);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

  if (type === "project") {
    const project = parsed.data as z.infer<typeof schemas.project>;
    if (body.action === "create") return NextResponse.json(await createProject(project));
    if (body.action === "update" && body.id) return NextResponse.json(await updateProject(body.id, project));
    return invalid("Choose a valid action.");
  }

  if (type === "volunteer") {
    const volunteer = parsed.data as z.infer<typeof schemas.volunteer>;
    if (body.action === "create") return NextResponse.json(await createVolunteer(volunteer));
    if (body.action === "update" && body.id) return NextResponse.json(await updateVolunteer(body.id, volunteer));
    return invalid("Choose a valid action.");
  }

  if (type === "activity") {
    const activity = parsed.data as z.infer<typeof schemas.activity>;
    if (body.action === "create") return NextResponse.json(await createActivity(activity));
    if (body.action === "update" && body.id) return NextResponse.json(await updateActivity(body.id, activity));
    return invalid("Choose a valid action.");
  }

  const normalized = normalize(type, parsed.data as Record<string, unknown>);
  if (body.action === "create") return NextResponse.json(await create(type, normalized));
  if (body.action === "update" && body.id) return NextResponse.json(await update(type, body.id, normalized));
  return invalid("Choose a valid action.");
}

function invalid(message = "Please check the highlighted information.") {
  return NextResponse.json({ error: message }, { status: 400 });
}

function normalize(type: ResourceType, data: Record<string, unknown>) {
  const clean = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, nullable(value)]));
  if (type === "education") {
    clean.courseworkJson = JSON.stringify(data.coursework);
    delete clean.coursework;
  }
  if (type === "skillGroup") {
    clean.itemsJson = JSON.stringify(data.items);
    delete clean.items;
  }
  return clean;
}

function projectData(data: z.infer<typeof schemas.project>) {
  return {
    title: data.title,
    role: nullable(data.role) as string | null,
    dateLabel: nullable(data.dateLabel) as string | null,
    stackTagsJson: JSON.stringify(data.stackTags),
    descriptionJson: JSON.stringify(data.description),
    githubUrl: nullable(data.githubUrl) as string | null,
    demoUrl: nullable(data.demoUrl) as string | null,
    status: nullable(data.status) as string | null,
    track: data.track,
    visibility: data.visibility,
    teaser: nullable(data.teaser) as string | null,
    metricsJson: JSON.stringify(data.metricLines),
    imageUrl: null,
  };
}

async function createProject(data: z.infer<typeof schemas.project>) {
  return prisma.project.create({
    data: {
      ...projectData(data),
      order: await prisma.project.count(),
      images: { create: data.images.map((url, order) => ({ url, order })) },
    },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

async function updateProject(id: string, data: z.infer<typeof schemas.project>) {
  await prisma.$transaction([
    prisma.projectImage.deleteMany({ where: { projectId: id } }),
    prisma.project.update({
      where: { id },
      data: {
        ...projectData(data),
        images: { create: data.images.map((url, order) => ({ url, order })) },
      },
    }),
  ]);
  return prisma.project.findUniqueOrThrow({ where: { id }, include: { images: { orderBy: { order: "asc" } } } });
}

function volunteerData(data: z.infer<typeof schemas.volunteer>) {
  return {
    title: data.title,
    org: nullable(data.org) as string | null,
    dateLabel: nullable(data.dateLabel) as string | null,
    description: nullable(data.description) as string | null,
  };
}

async function createVolunteer(data: z.infer<typeof schemas.volunteer>) {
  return prisma.volunteerExperience.create({
    data: {
      ...volunteerData(data),
      order: await prisma.volunteerExperience.count(),
      images: { create: data.images.map((url, order) => ({ url, order })) },
    },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

async function updateVolunteer(id: string, data: z.infer<typeof schemas.volunteer>) {
  await prisma.$transaction([
    prisma.volunteerImage.deleteMany({ where: { volunteerId: id } }),
    prisma.volunteerExperience.update({
      where: { id },
      data: {
        ...volunteerData(data),
        images: { create: data.images.map((url, order) => ({ url, order })) },
      },
    }),
  ]);
  return prisma.volunteerExperience.findUniqueOrThrow({ where: { id }, include: { images: { orderBy: { order: "asc" } } } });
}

function activityData(data: z.infer<typeof schemas.activity>) {
  return {
    title: data.title,
    org: nullable(data.org) as string | null,
    location: nullable(data.location) as string | null,
    dateLabel: nullable(data.dateLabel) as string | null,
    description: nullable(data.description) as string | null,
  };
}

async function createActivity(data: z.infer<typeof schemas.activity>) {
  return prisma.activity.create({
    data: {
      ...activityData(data),
      order: await prisma.activity.count(),
      images: { create: data.images.map((url, order) => ({ url, order })) },
    },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

async function updateActivity(id: string, data: z.infer<typeof schemas.activity>) {
  await prisma.$transaction([
    prisma.activityImage.deleteMany({ where: { activityId: id } }),
    prisma.activity.update({
      where: { id },
      data: {
        ...activityData(data),
        images: { create: data.images.map((url, order) => ({ url, order })) },
      },
    }),
  ]);
  return prisma.activity.findUniqueOrThrow({ where: { id }, include: { images: { orderBy: { order: "asc" } } } });
}

async function nextOrder(type: ResourceType) {
  switch (type) {
    case "quickFact": return prisma.quickFact.count();
    case "education": return prisma.educationEntry.count();
    case "project": return prisma.project.count();
    case "skillGroup": return prisma.skillGroup.count();
    case "certificate": return prisma.certificate.count();
    case "achievement": return prisma.achievement.count();
    case "volunteer": return prisma.volunteerExperience.count();
    case "activity": return prisma.activity.count();
    case "interest": return prisma.interest.count();
    case "language": return prisma.language.count();
    case "attachment": return prisma.attachment.count();
  }
}

async function create(type: Exclude<ResourceType, "project">, data: Record<string, unknown>) {
  const value = { ...data, order: await nextOrder(type) } as never;
  switch (type) {
    case "quickFact": return prisma.quickFact.create({ data: value });
    case "education": return prisma.educationEntry.create({ data: value });
    case "skillGroup": return prisma.skillGroup.create({ data: value });
    case "certificate": return prisma.certificate.create({ data: value });
    case "achievement": return prisma.achievement.create({ data: value });
    case "volunteer": return prisma.volunteerExperience.create({ data: value });
    case "activity": return prisma.activity.create({ data: value });
    case "interest": return prisma.interest.create({ data: value });
    case "language": return prisma.language.create({ data: value });
    case "attachment": return prisma.attachment.create({ data: value });
  }
}

async function update(type: Exclude<ResourceType, "project">, id: string, data: Record<string, unknown>) {
  const value = data as never;
  switch (type) {
    case "quickFact": return prisma.quickFact.update({ where: { id }, data: value });
    case "education": return prisma.educationEntry.update({ where: { id }, data: value });
    case "skillGroup": return prisma.skillGroup.update({ where: { id }, data: value });
    case "certificate": return prisma.certificate.update({ where: { id }, data: value });
    case "achievement": return prisma.achievement.update({ where: { id }, data: value });
    case "volunteer": return prisma.volunteerExperience.update({ where: { id }, data: value });
    case "activity": return prisma.activity.update({ where: { id }, data: value });
    case "interest": return prisma.interest.update({ where: { id }, data: value });
    case "language": return prisma.language.update({ where: { id }, data: value });
    case "attachment": return prisma.attachment.update({ where: { id }, data: value });
  }
}

async function remove(type: ResourceType, id: string) {
  switch (type) {
    case "quickFact": return prisma.quickFact.delete({ where: { id } });
    case "education": return prisma.educationEntry.delete({ where: { id } });
    case "project": return prisma.project.delete({ where: { id } });
    case "skillGroup": return prisma.skillGroup.delete({ where: { id } });
    case "certificate": return prisma.certificate.delete({ where: { id } });
    case "achievement": return prisma.achievement.delete({ where: { id } });
    case "volunteer": return prisma.volunteerExperience.delete({ where: { id } });
    case "activity": return prisma.activity.delete({ where: { id } });
    case "interest": return prisma.interest.delete({ where: { id } });
    case "language": return prisma.language.delete({ where: { id } });
    case "attachment": return prisma.attachment.delete({ where: { id } });
  }
}

async function reorder(type: ResourceType, ids: string[]) {
  const tasks = ids.map((id, order) => {
    switch (type) {
      case "quickFact": return prisma.quickFact.update({ where: { id }, data: { order } });
      case "education": return prisma.educationEntry.update({ where: { id }, data: { order } });
      case "project": return prisma.project.update({ where: { id }, data: { order } });
      case "skillGroup": return prisma.skillGroup.update({ where: { id }, data: { order } });
      case "certificate": return prisma.certificate.update({ where: { id }, data: { order } });
      case "achievement": return prisma.achievement.update({ where: { id }, data: { order } });
      case "volunteer": return prisma.volunteerExperience.update({ where: { id }, data: { order } });
      case "activity": return prisma.activity.update({ where: { id }, data: { order } });
      case "interest": return prisma.interest.update({ where: { id }, data: { order } });
      case "language": return prisma.language.update({ where: { id }, data: { order } });
      case "attachment": return prisma.attachment.update({ where: { id }, data: { order } });
    }
  });
  await prisma.$transaction(tasks);
}
