import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/db";
import { deleteDocumentFile, readDocumentFile } from "@/lib/documents/storage";
import type { ProfileDocumentType } from "@/lib/types";

const VALID_TYPES = new Set<ProfileDocumentType>(["resume", "cover_letter"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { type } = await params;
  if (!VALID_TYPES.has(type as ProfileDocumentType)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }

  try {
    const user = await requireUser();
    const record = await prisma.userDocument.findUnique({
      where: { userId_type: { userId: user.id, type } },
    });

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bytes = await readDocumentFile(record.storagePath);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": record.mimeType,
        "Content-Disposition": `attachment; filename="${record.fileName}"`,
        "Content-Length": String(record.sizeBytes),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { type } = await params;
  if (!VALID_TYPES.has(type as ProfileDocumentType)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }

  try {
    const user = await requireUser();
    const record = await prisma.userDocument.findUnique({
      where: { userId_type: { userId: user.id, type } },
    });

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteDocumentFile(record.storagePath);
    await prisma.userDocument.delete({ where: { id: record.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
