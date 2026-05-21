import type { ReactNode } from "react";
import Button from "./Button";

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmSheet = ({
  open,
  title,
  description,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  onConfirm,
  onCancel,
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
      </div>
    </div>
  );
};

export default ConfirmSheet;
