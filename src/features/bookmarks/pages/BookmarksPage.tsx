import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AppHeader from "../../../components/AppHeader";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import EmptyState from "../../../components/EmptyState";
import ErrorState from "../../../components/ErrorState";
import OptionCard from "../../../components/OptionCard";
import PageShell from "../../../components/PageShell";
import QuestionMeta from "../../../components/QuestionMeta";
import ReferenceBox from "../../../components/ReferenceBox";
import AppLoader from "../../../components/loader";
import { useBookmarks } from "../hooks/useBookmarks";
import type { AnswerOption } from "../../sessions/types";
import { cn } from "../../../lib/cn";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

type BookmarkQuestion = ReturnType<typeof useBookmarks>["bookmarks"][number];

const PracticeBookmarksCard = ({
  starting,
  onStart,
}: {
  starting: boolean;
  onStart: () => void;
}) => (
  <Card className="border-default surface-muted">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-display font-bold text-[var(--accent-ink)]">
          תרגול סימניות
        </p>
        <p className="mt-1 text-sm text-secondary">
          צור סשן מכל השאלות ששמרת.
        </p>
      </div>

      <Button disabled={starting} onClick={onStart}>
        {starting ? <AppLoader variant="button" label="מתחיל..." /> : "התחל"}
      </Button>
    </div>
  </Card>
);

const BookmarkItem = ({
  question,
  open,
  removing,
  onToggle,
  onRemove,
}: {
  question: BookmarkQuestion;
  open: boolean;
  removing: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) => {
  const reference = question.reference.trim();
  const panelId = `bookmark-${question.stable_id}`;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <QuestionMeta
            number={question.number ?? undefined}
            examDate={question.exam_date}
            part={question.part ?? undefined}
          />

          <button
            type="button"
            className="w-full rounded-xl text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/30"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
          >
            <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink)] sm:text-base sm:leading-8">
              {question.body}
            </p>
          </button>
        </div>

        <Button
          variant="ghost"
          className="shrink-0 px-3 py-2 text-sm"
          disabled={removing}
          onClick={onRemove}
        >
          {removing ? <AppLoader variant="button" label="מסיר..." /> : "הסר"}
        </Button>
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-xl px-1 py-1 text-xs font-medium text-secondary transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/30"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <ChevronLeft
          className={cn("h-4 w-4 transition-transform", open && "-rotate-90")}
          strokeWidth={2.4}
        />
        {open ? "הסתר תשובה" : "הצג תשובה"}
      </button>

      {open && (
        <div id={panelId} className="space-y-3">
          <div className="grid gap-2">
            {OPTIONS.map((option) => (
              <OptionCard
                key={option}
                mode="review"
                label={option}
                text={question.options[option]}
                isCorrect={question.correct_answer === option}
                showCorrectBadge
              />
            ))}
          </div>

          {reference && <ReferenceBox reference={reference} />}
        </div>
      )}
    </Card>
  );
};

const BookmarksPage = () => {
  const navigate = useNavigate();

  const {
    status,
    bookmarks,
    removingStableId,
    starting,
    retry,
    remove,
    startBookmarksPractice,
  } = useBookmarks();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  if (status === "loading") {
    return (
      <PageShell className="pb-8">
        <div className="space-y-4">
          <AppHeader title="סימניות" />
          <AppLoader variant="list" rows={4} />
        </div>
      </PageShell>
    );
  }

  if (status === "error") {
    return (
      <PageShell className="pb-8">
        <ErrorState
          message="החיבור נכשל. נסה שוב"
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="pb-8">
      <div className="space-y-4">
        <AppHeader
          title="סימניות"
          meta={
            <p className="tabular-nums text-sm text-secondary">
              {bookmarks.length} שאלות שמורות
            </p>
          }
          actions={
            <Button
              variant="ghost"
              className="min-h-10 rounded-xl px-3 py-2 text-sm"
              onClick={() => navigate("/practice/new")}
            >
              תרגול חדש
            </Button>
          }
        />

        {bookmarks.length === 0 ? (
          <Card className="surface-muted">
            <EmptyState
              title="אין סימניות עדיין"
              description="שאלות שתסמן יופיעו כאן לחזרה מהירה."
              action={
                <Button onClick={() => navigate("/practice/new")}>
                  התחל תרגול
                </Button>
              }
            />
          </Card>
        ) : (
          <>
            <PracticeBookmarksCard
              starting={starting}
              onStart={startBookmarksPractice}
            />

            <section className="grid gap-3">
              {bookmarks.map((question) => (
                <BookmarkItem
                  key={question.stable_id}
                  question={question}
                  open={expanded.has(question.stable_id)}
                  removing={removingStableId === question.stable_id}
                  onToggle={() => toggle(question.stable_id)}
                  onRemove={() => remove(question.stable_id)}
                />
              ))}
            </section>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default BookmarksPage;