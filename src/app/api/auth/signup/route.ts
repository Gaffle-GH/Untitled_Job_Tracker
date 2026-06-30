import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import {
  createSession,
  ensureUserProfile,
  hashPassword,
  profileFromRecord,
} from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { applicationToClient } from "@/lib/db/applications";
import { MOCK_APPLICATIONS } from "@/lib/mock-data";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL in .env.local" },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    email?: string;
    name?: string;
    password?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  const password = body.password;

  if (!email || !name || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Name, email, and password (6+ chars) are required" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(password),
    },
  });

  await ensureUserProfile(user.id);

  const starterApps = MOCK_APPLICATIONS.filter((app) =>
    ["manual", "discover"].includes(app.source),
  );

  await prisma.application.createMany({
    data: starterApps.map((app) => ({
      userId: user.id,
      company: app.company,
      title: app.title,
      location: app.location,
      source: app.source,
      status: app.status,
      appliedAt: app.appliedAt,
      salary: app.salary,
      url: app.url,
      notes: app.notes,
      companyDomain: app.companyDomain,
      logoUrl: app.logoUrl,
    })),
  });

  await createSession(user.id);

  const profile = await ensureUserProfile(user.id);
  const applications = await prisma.application.findMany({ where: { userId: user.id } });

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
    profile: profileFromRecord(profile),
    applications: applications.map(applicationToClient),
  });
}
