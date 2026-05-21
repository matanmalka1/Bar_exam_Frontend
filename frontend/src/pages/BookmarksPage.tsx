import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import ReviewOption from "../components/ReviewOption";
import AppLoader from "../components/loader";
import { useBookmarks } from "../features/bookmarks/hooks/useBookmarks";
import type { AnswerOption, QuestionPart } from "../features/sessions/types";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];
const NETWORK_ERR = "החיבור נכשל. נסה שוב";

const partLabel = (part: QuestionPart) => {
  if (part === "B") return "דין דיוני";
  if (part === "C") return "דין מהותי";
  return part;
};

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
    return <AppLoader variant="page" label="טוען נתונים..." />;
  }

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <ErrorState
          message={NETWORK_ERR}
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-4 p-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--accent-ink)]">
            סימניות
          </h1>
          <p className="text-sm text-secondary">
            {bookmarks.length} שאלות שמורות
          </p>
        </div>
        <Button onClick={() => navigate("/practice/new")}>תרגול חדש</Button>
      </header>

      {removeError && (
        <Card className="border-2 border-strong bg-white">
          <p className="text-sm text-primary font-semibold">{removeError}</p>
        </Card>
      )}

      {startError && (
        <Card className="border-2 border-strong bg-white">
          <p className="text-sm text-primary font-semibold">{startError}</p>
        </Card>
      )}

      {bookmarks.length === 0 ? (
        <Card>
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
          <Card className="border-default surface-muted">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--accent-ink)]">
                  תרגול סימניות
                </p>
                <p className="mt-1 text-sm text-secondary">
                  צור סשן מכל השאלות ששמרת.
                </p>
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
              return (
                <Card key={question.stable_id} className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-secondary">
                        {question.number !== null &&
                          question.number !== undefined && (
                            <span>שאלה {question.number}</span>
                          )}
                        {question.exam_date && (
                          <span>{question.exam_date}</span>
                        )}
                        {question.part && (
                          <span>{partLabel(question.part)}</span>
                        )}
                      </div>
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
                      <ReviewOption
                        key={option}
                        label={option}
                        text={question.options[option]}
                        isCorrect={question.correct_answer === option}
                      />
                    ))}
                  </div>

                  {question.reference && (
                    <div className="rounded-xl border border-default surface-muted p-3">
                      <p className="text-xs font-semibold text-[var(--accent)]">
                        הפניה
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-primary">
                        {question.reference}
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
