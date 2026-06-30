import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import type { UserProfile } from "@/lib/types";
import { DEFAULT_USER_PROFILE } from "@/lib/types";

export const AUTH_COOKIE = "jt-auth";
const SESSION_DAYS = 30;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  notifyOnStatusChange: boolean;
};

function parseSkills(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function profileFromRecord(record: {
  location: string;
  latitude: number | null;
  longitude: number | null;
  rolePreference: string;
  skills: string;
  openToRemote: boolean;
}): UserProfile & { latitude?: number; longitude?: number } {
  return {
    location: record.location,
    rolePreference: record.rolePreference,
    skills: parseSkills(record.skills),
    openToRemote: record.openToRemote,
    ...(record.latitude != null ? { latitude: record.latitude } : {}),
    ...(record.longitude != null ? { longitude: record.longitude } : {}),
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  const jar = await cookies();
  jar.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });

  return token;
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => undefined);
    jar.delete(AUTH_COOKIE);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isDatabaseConfigured()) return null;

  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    jar.delete(AUTH_COOKIE);
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    notifyOnStatusChange: session.user.notifyOnStatusChange,
  };
}

export async function ensureUserProfile(userId: string) {
  const existing = await prisma.userProfile.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.userProfile.create({
    data: {
      userId,
      location: DEFAULT_USER_PROFILE.location,
      rolePreference: DEFAULT_USER_PROFILE.rolePreference,
      skills: JSON.stringify(DEFAULT_USER_PROFILE.skills),
      openToRemote: DEFAULT_USER_PROFILE.openToRemote,
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
