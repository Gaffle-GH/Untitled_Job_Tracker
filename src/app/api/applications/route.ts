import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/db";
import { applicationToClient } from "@/lib/db/applications";
import { geocodeLocation } from "@/lib/geocode";
import { formatLocationDisplay, normalizeLocationStorage } from "@/lib/location-normalize";
import { STATUS_LABELS, SOURCE_LABELS, type ApplicationStatus, type JobSource } from "@/lib/types";

const VALID_STATUSES = new Set(Object.keys(STATUS_LABELS));
const VALID_SOURCES = new Set(Object.keys(SOURCE_LABELS));

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

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const user = await requireUser();
    const body = (await request.json()) as {
      company?: string;
      title?: string;
      location?: string;
      zipCode?: string;
      source?: string;
      status?: string;
      appliedAt?: string;
      salary?: string;
      url?: string;
      notes?: string;
      companyDomain?: string;
      logoUrl?: string;
    };

    const company = body.company?.trim();
    const title = body.title?.trim();
    const stored = normalizeLocationStorage({
      label: body.location?.trim() || "—",
      zipCode: body.zipCode,
    });
    const location = stored.location || "—";
    const zipCode = stored.zipCode ?? null;
    const source = body.source ?? "manual";
    const status = body.status ?? "applied";
    const appliedAt = body.appliedAt ?? new Date().toISOString().split("T")[0];

    if (!company || !title) {
      return NextResponse.json({ error: "Company and title are required" }, { status: 400 });
    }
    if (!VALID_SOURCES.has(source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }
    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    let latitude: number | undefined;
    let longitude: number | undefined;
    if (location !== "—" && !/remote/i.test(location)) {
      const geo = await geocodeLocation(formatLocationDisplay(location, zipCode ?? undefined));
      if (geo) {
        latitude = geo.latitude;
        longitude = geo.longitude;
      }
    }

    const created = await prisma.application.create({
      data: {
        userId: user.id,
        company,
        title,
        location,
        zipCode,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        source,
        status,
        appliedAt,
        salary: body.salary?.trim() || null,
        url: body.url?.trim() || null,
        notes: body.notes?.trim() || null,
        companyDomain: body.companyDomain?.trim() || null,
        logoUrl: body.logoUrl?.trim() || null,
      },
    });

    return NextResponse.json(applicationToClient(created), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
