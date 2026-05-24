import { Bookmark } from "lucide-react";
import { cn } from "../lib/cn";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  busy: boolean;
  onToggle: () => void;
}

const BookmarkButton = ({
  isBookmarked,
  busy,
  onToggle,
}: BookmarkButtonProps) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={busy}
    aria-label={isBookmarked ? "הסר סימניה" : "הוסף סימניה"}
    aria-pressed={isBookmarked}
    className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full text-secondary transition hover:bg-[var(--surface-muted)] hover:text-primary disabled:opacity-45 active:scale-95"
  >
    <Bookmark
      className={cn(
        "h-5 w-5 transition-colors",
        isBookmarked && "text-primary",
        busy && "animate-pulse",
      )}
      fill={isBookmarked ? "currentColor" : "none"}
      strokeWidth={isBookmarked ? 2 : 1.8}
      aria-hidden="true"
    />
  </button>
);

export default BookmarkButton;
