import { NextResponse } from "next/server";
import { requireUser, ensureUserProfile, profileFromRecord } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { geocodeLocation } from "@/lib/geocode";
import { isDatabaseConfigured } from "@/lib/db";
import type { UserProfile } from "@/lib/types";

export async function PUT(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const user = await requireUser();
    const body = (await request.json()) as Partial<UserProfile> & {
      notifyOnStatusChange?: boolean;
    };

    let latitude: number | undefined;
    let longitude: number | undefined;

    if (body.location?.trim()) {
      const geo = await geocodeLocation(body.location);
      if (geo) {
        latitude = geo.latitude;
        longitude = geo.longitude;
      }
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        location: body.location ?? "",
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        rolePreference: body.rolePreference ?? "",
        skills: JSON.stringify(body.skills ?? []),
        openToRemote: body.openToRemote ?? true,
      },
      update: {
        ...(body.location !== undefined ? { location: body.location } : {}),
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
        ...(body.rolePreference !== undefined ? { rolePreference: body.rolePreference } : {}),
        ...(body.skills !== undefined ? { skills: JSON.stringify(body.skills) } : {}),
        ...(body.openToRemote !== undefined ? { openToRemote: body.openToRemote } : {}),
      },
    });

    if (body.notifyOnStatusChange !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: { notifyOnStatusChange: body.notifyOnStatusChange },
      });
    }

    const updatedUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

    return NextResponse.json({
      profile: profileFromRecord(profile),
      notifyOnStatusChange: updatedUser.notifyOnStatusChange,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
