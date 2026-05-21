import { Eye, EyeOff } from "lucide-react";

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const PasswordToggle = ({
  visible,
  onToggle,
  disabled,
}: PasswordToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    aria-label={visible ? "הסתר סיסמה" : "הצג סיסמה"}
    aria-pressed={visible}
    className="focus-ring pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-secondary transition hover:text-primary disabled:opacity-45"
  >
    {visible ? (
      <EyeOff className="h-4 w-4" aria-hidden="true" />
    ) : (
      <Eye className="h-4 w-4" aria-hidden="true" />
    )}
  </button>
);

export default PasswordToggle;
