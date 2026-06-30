import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/db";
import { applicationToClient } from "@/lib/db/applications";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const user = await requireUser();
    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { appliedAt: "desc" },
    });
    return NextResponse.json(applications.map(applicationToClient));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
