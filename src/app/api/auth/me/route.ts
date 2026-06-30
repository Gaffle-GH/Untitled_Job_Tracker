import { NextResponse } from "next/server";
import { getCurrentUser, ensureUserProfile, profileFromRecord } from "@/lib/auth/server";
import { isDatabaseConfigured } from "@/lib/db";
import { prisma } from "@/lib/db";
import { applicationToClient } from "@/lib/db/applications";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ user: null, database: false });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null, database: true });
  }

  const profile = await ensureUserProfile(user.id);
  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { appliedAt: "desc" },
  });

  return NextResponse.json({
    database: true,
    user,
    profile: profileFromRecord(profile),
    applications: applications.map(applicationToClient),
  });
}
