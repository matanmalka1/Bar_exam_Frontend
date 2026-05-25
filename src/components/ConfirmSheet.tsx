import { useEffect, type ReactNode } from "react";
import Button from "./Button";

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tertiaryLabel?: string;
  confirmVariant?: "primary" | "danger";
  closeOnBackdrop?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onTertiary?: () => void;
}

const ConfirmSheet = ({
  open,
  title,
  description,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  tertiaryLabel,
  confirmVariant = "primary",
  closeOnBackdrop = true,
  onConfirm,
  onCancel,
  onTertiary,
}: ConfirmSheetProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  if (!open) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={handleBackdropClick}
      aria-hidden={!open}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-sheet-title"
        aria-describedby={description ? "confirm-sheet-description" : undefined}
        className="surface w-full max-w-md rounded-2xl border border-default p-4 shadow-[var(--shadow-elevated)] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-150 sm:p-5"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--border-default)] sm:hidden" />

        <div className="space-y-2 text-right">
          <h2
            id="confirm-sheet-title"
            className="text-lg font-semibold text-primary"
          >
            {title}
          </h2>

          {description && (
            <div
              id="confirm-sheet-description"
              className="text-sm leading-6 text-secondary"
            >
              {description}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>

          <Button
            variant={confirmVariant}
            fullWidth
            autoFocus
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>

        {tertiaryLabel && onTertiary && (
          <Button
            variant="ghost"
            fullWidth
            className="mt-2"
            onClick={onTertiary}
          >
            {tertiaryLabel}
          </Button>
        )}
      </section>
    </div>
  );
};

export default ConfirmSheet;
