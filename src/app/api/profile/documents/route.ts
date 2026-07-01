import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/db";
import {
  deleteDocumentFile,
  isAcceptedDocumentMime,
  saveDocumentFile,
} from "@/lib/documents/storage";
import type { ProfileDocumentMeta, ProfileDocumentType } from "@/lib/types";

const VALID_TYPES = new Set<ProfileDocumentType>(["resume", "cover_letter"]);

function toMeta(record: {
  type: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: Date;
}): ProfileDocumentMeta {
  return {
    type: record.type as ProfileDocumentType,
    fileName: record.fileName,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const user = await requireUser();
    const documents = await prisma.userDocument.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ documents: documents.map(toMeta) });
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
    const formData = await request.formData();
    const type = String(formData.get("type") ?? "");
    const file = formData.get("file");

    if (!VALID_TYPES.has(type as ProfileDocumentType)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    if (!isAcceptedDocumentMime(mimeType)) {
      return NextResponse.json(
        { error: "Accepted formats: PDF, DOC, DOCX, or TXT" },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const storagePath = await saveDocumentFile(
      user.id,
      type as ProfileDocumentType,
      file.name,
      bytes,
    );

    const existing = await prisma.userDocument.findUnique({
      where: { userId_type: { userId: user.id, type } },
    });

    if (existing) {
      await deleteDocumentFile(existing.storagePath);
    }

    const record = await prisma.userDocument.upsert({
      where: { userId_type: { userId: user.id, type } },
      create: {
        userId: user.id,
        type,
        fileName: file.name,
        mimeType,
        sizeBytes: file.size,
        storagePath,
      },
      update: {
        fileName: file.name,
        mimeType,
        sizeBytes: file.size,
        storagePath,
      },
    });

    return NextResponse.json({ document: toMeta(record) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
