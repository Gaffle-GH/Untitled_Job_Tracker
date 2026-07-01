"use client";

import { useEffect, useState } from "react";
import { PopOverlay } from "@/components/motion/Pop";
import { Button } from "@/components/ui";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "lime" | "pink";
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "lime",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      return;
    }

    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [loading, onClose, open]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <PopOverlay
      open={open}
      onClose={loading ? undefined : onClose}
      zIndexClass="z-[60]"
      panelClassName="w-full max-w-md border-[3px] border-black bg-white brutal-shadow-lg"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <div className="border-b-[3px] border-black bg-accent-yellow px-4 py-3">
          <h2 id="confirm-dialog-title" className="brutal-heading text-lg">
            {title}
          </h2>
        </div>
        <div id="confirm-dialog-desc" className="p-4 text-sm font-medium leading-relaxed">
          {description}
        </div>
        <div className="flex gap-2 border-t-[3px] border-black/10 p-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            className="flex-1"
            disabled={loading}
            onClick={() => void handleConfirm()}
          >
            {loading ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </PopOverlay>
  );
}
