import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import type { ProfileDocumentType } from "@/lib/types";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "documents");
const MAX_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function isAcceptedDocumentMime(mimeType: string) {
  return ACCEPTED_DOCUMENT_TYPES.has(mimeType);
}

export function documentStoragePath(userId: string, type: ProfileDocumentType, fileName: string) {
  const extension = path.extname(fileName) || ".bin";
  return path.join(STORAGE_ROOT, userId, `${type}${extension}`);
}

export async function saveDocumentFile(
  userId: string,
  type: ProfileDocumentType,
  fileName: string,
  bytes: Buffer,
) {
  if (bytes.byteLength > MAX_BYTES) {
    throw new Error("File exceeds 5 MB limit");
  }

  const target = documentStoragePath(userId, type, fileName);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
  return target;
}

export async function readDocumentFile(storagePath: string) {
  return readFile(storagePath);
}

export async function deleteDocumentFile(storagePath: string) {
  try {
    await unlink(storagePath);
  } catch {
    /* ignore missing files */
  }
}
