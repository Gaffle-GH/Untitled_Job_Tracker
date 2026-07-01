import type { ProfileDocumentMeta, ProfileDocumentType } from "@/lib/types";

const STORAGE_KEY = "job-tracker-documents";
const MAX_BYTES = 1_500_000;

type StoredDocument = ProfileDocumentMeta & {
  dataUrl: string;
};

type StoredDocuments = Partial<Record<ProfileDocumentType, StoredDocument>>;

function readStore(): StoredDocuments {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredDocuments) : {};
  } catch {
    return {};
  }
}

function writeStore(documents: StoredDocuments) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}

export function listLocalDocuments(): ProfileDocumentMeta[] {
  return Object.values(readStore()).map(({ dataUrl: _dataUrl, ...meta }) => meta);
}

export async function saveLocalDocument(
  type: ProfileDocumentType,
  file: File,
): Promise<ProfileDocumentMeta> {
  if (file.size > MAX_BYTES) {
    throw new Error("File exceeds 1.5 MB browser limit — sign in to upload larger files");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const meta: StoredDocument = {
    type,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    updatedAt: new Date().toISOString(),
    dataUrl,
  };

  const store = readStore();
  store[type] = meta;
  writeStore(store);
  return {
    type: meta.type,
    fileName: meta.fileName,
    mimeType: meta.mimeType,
    sizeBytes: meta.sizeBytes,
    updatedAt: meta.updatedAt,
  };
}

export function deleteLocalDocument(type: ProfileDocumentType) {
  const store = readStore();
  delete store[type];
  writeStore(store);
}

export function getLocalDocumentDownload(type: ProfileDocumentType) {
  const entry = readStore()[type];
  if (!entry) return null;
  return {
    fileName: entry.fileName,
    mimeType: entry.mimeType,
    dataUrl: entry.dataUrl,
  };
}
