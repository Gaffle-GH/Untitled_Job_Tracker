import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/db";
import { applicationToClient } from "@/lib/db/applications";
import { sendStatusChangeEmail } from "@/lib/email";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/types";

const VALID_STATUSES = new Set(Object.keys(STATUS_LABELS));

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;

  try {
    const user = await requireUser();
    const body = (await request.json()) as { status?: string };
    const status = body.status;

    if (!status || !VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.application.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const previousStatus = existing.status as ApplicationStatus;
    const newStatus = status as ApplicationStatus;

    if (previousStatus === newStatus) {
      return NextResponse.json(applicationToClient(existing));
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: newStatus },
    });

    if (user.notifyOnStatusChange) {
      await sendStatusChangeEmail({
        to: user.email,
        name: user.name,
        company: updated.company,
        title: updated.title,
        previousStatus,
        newStatus,
      });
    }

    return NextResponse.json(applicationToClient(updated));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
