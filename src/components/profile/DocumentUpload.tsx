"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui";
import {
  deleteLocalDocument,
  getLocalDocumentDownload,
  listLocalDocuments,
  saveLocalDocument,
} from "@/lib/documents/local-documents";
import type { ProfileDocumentMeta, ProfileDocumentType } from "@/lib/types";
import {
  deleteProfileDocumentApi,
  fetchProfileDocumentsApi,
  uploadProfileDocumentApi,
} from "@/services/authService";

const DOCUMENT_LABELS: Record<ProfileDocumentType, string> = {
  resume: "Resume",
  cover_letter: "Cover letter",
};

const ACCEPT =
  ".pdf,.doc,.docx,.txt,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentSlot({
  type,
  document,
  databaseMode,
  onChange,
}: {
  type: ProfileDocumentType;
  document?: ProfileDocumentMeta;
  databaseMode: boolean;
  onChange: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      if (databaseMode) {
        await uploadProfileDocumentApi(type, file);
      } else {
        await saveLocalDocument(type, file);
      }
      onChange();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (databaseMode) {
      window.open(`/api/profile/documents/${type}`, "_blank", "noopener,noreferrer");
      return;
    }

    const local = getLocalDocumentDownload(type);
    if (!local) return;
    const anchor = window.document.createElement("a");
    anchor.href = local.dataUrl;
    anchor.download = local.fileName;
    anchor.click();
  };

  const handleDelete = async () => {
    setError(null);
    setUploading(true);
    try {
      if (databaseMode) {
        await deleteProfileDocumentApi(type);
      } else {
        deleteLocalDocument(type);
      }
      onChange();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-[3px] border-black bg-white p-4 brutal-shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-8 w-8 items-center justify-center border-2 border-black bg-accent-cyan">
            <FileText className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-bold uppercase">{DOCUMENT_LABELS[type]}</p>
            {document ? (
              <p className="mt-1 text-xs font-medium text-black/60">
                {document.fileName} · {formatBytes(document.sizeBytes)}
              </p>
            ) : (
              <p className="mt-1 text-xs font-medium text-black/50">
                PDF, DOC, DOCX, or TXT
              </p>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 normal-case tracking-normal"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {document ? "Replace" : "Import"}
        </Button>
        {document ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 normal-case tracking-normal"
              disabled={uploading}
              onClick={() => void handleDownload()}
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Download
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 normal-case tracking-normal"
              disabled={uploading}
              onClick={() => void handleDelete()}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Remove
            </Button>
          </>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );
}

export function DocumentUploadSection({ databaseMode }: { databaseMode: boolean }) {
  const [documents, setDocuments] = useState<ProfileDocumentMeta[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (databaseMode) {
      try {
        const result = await fetchProfileDocumentsApi();
        setDocuments(result.documents);
      } catch {
        setDocuments([]);
      }
    } else {
      setDocuments(listLocalDocuments());
    }
    setLoaded(true);
  }, [databaseMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const byType = (type: ProfileDocumentType) => documents.find((doc) => doc.type === type);

  if (!loaded) {
    return (
      <div className="text-xs font-medium text-black/50">Loading documents…</div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide">Resume & cover letter</p>
        <p className="mt-1 text-[10px] font-medium text-black/50">
          Import files to keep them handy while you apply — stored with your profile
          {databaseMode ? "" : " in this browser"}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <DocumentSlot
          type="resume"
          document={byType("resume")}
          databaseMode={databaseMode}
          onChange={() => void refresh()}
        />
        <DocumentSlot
          type="cover_letter"
          document={byType("cover_letter")}
          databaseMode={databaseMode}
          onChange={() => void refresh()}
        />
      </div>
    </div>
  );
}
