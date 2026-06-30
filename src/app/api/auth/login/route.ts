import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import {
  createSession,
  ensureUserProfile,
  profileFromRecord,
  verifyPassword,
} from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { applicationToClient } from "@/lib/db/applications";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL in .env.local" },
      { status: 503 },
    );
  }

  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(user.id);

  const profile = await ensureUserProfile(user.id);
  const applications = await prisma.application.findMany({ where: { userId: user.id } });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      notifyOnStatusChange: user.notifyOnStatusChange,
    },
    profile: profileFromRecord(profile),
    applications: applications.map(applicationToClient),
  });
}
