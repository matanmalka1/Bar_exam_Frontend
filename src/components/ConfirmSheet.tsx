import type { ReactNode } from "react";
import Button from "./Button";

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tertiaryLabel?: string;
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
  onConfirm,
  onCancel,
  onTertiary,
}: ConfirmSheetProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="surface w-full rounded-t-2xl p-4 shadow-[var(--shadow-elevated)]">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-secondary">{description}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" fullWidth onClick={onConfirm}>
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
      </div>
    </div>
  );
};

export default ConfirmSheet;
