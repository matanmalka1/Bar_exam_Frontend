import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import AppHeader from "../components/AppHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import OptionCard from "../components/OptionCard";
import QuestionMeta from "../components/QuestionMeta";
import AppLoader from "../components/loader";
import { useBookmarks } from "../features/bookmarks/hooks/useBookmarks";
import type { AnswerOption } from "../features/sessions/types";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const BookmarksPage = () => {
  const navigate = useNavigate();
  const {
    status,
    bookmarks,
    removeError,
    removingStableId,
    starting,
    startError,
    retry,
    remove,
    startBookmarksPractice,
  } = useBookmarks();

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-[720px] space-y-4 p-4">
        <AppHeader title="סימניות" />
        <AppLoader variant="list" rows={4} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <ErrorState
          message="החיבור נכשל. נסה שוב"
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-4 p-4">
      <AppHeader
        title="סימניות"
        meta={<p className="tabular-nums text-sm text-secondary">{bookmarks.length} שאלות שמורות</p>}
        actions={
          <Button
            className="min-h-10 rounded-xl px-3 py-2 text-sm"
            onClick={() => navigate("/practice/new")}
          >
            תרגול חדש
          </Button>
        }
      />

      {removeError && <Alert variant="error">{removeError}</Alert>}
      {startError && <Alert variant="error">{startError}</Alert>}

      {bookmarks.length === 0 ? (
        <Card>
          <EmptyState
            title="אין סימניות עדיין"
            description="שאלות שתסמן יופיעו כאן לחזרה מהירה."
            action={
              <Button onClick={() => navigate("/practice/new")}>התחל תרגול</Button>
            }
          />
        </Card>
      ) : (
        <>
          <Card className="border-default surface-muted">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--accent-ink)]">תרגול סימניות</p>
                <p className="mt-1 text-sm text-secondary">צור סשן מכל השאלות ששמרת.</p>
              </div>
              <Button disabled={starting} onClick={startBookmarksPractice}>
                {starting ? (
                  <AppLoader variant="button" label="מתחיל..." />
                ) : (
                  "התחל"
                )}
              </Button>
            </div>
          </Card>

          <section className="grid gap-3">
            {bookmarks.map((question) => {
              const removing = removingStableId === question.stable_id;
              const reference = question.reference.trim();
              return (
                <Card key={question.stable_id} className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <QuestionMeta
                        number={question.number ?? undefined}
                        examDate={question.exam_date}
                        part={question.part ?? undefined}
                      />
                      <p className="whitespace-pre-wrap text-base leading-8 text-[var(--ink)]">
                        {question.body}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="shrink-0 px-3 py-2 text-sm"
                      disabled={removing}
                      onClick={() => remove(question.stable_id)}
                    >
                      {removing ? (
                        <AppLoader variant="button" label="מסיר..." />
                      ) : (
                        "הסר"
                      )}
                    </Button>
                  </div>

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

                  {reference && (
                    <div className="rounded-xl border border-default surface-muted p-3">
                      <p className="text-xs font-semibold text-[var(--accent)]">הפניה</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-primary">
                        {reference}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
};

export default BookmarksPage;
