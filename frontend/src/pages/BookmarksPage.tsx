import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import PageLoading from "../components/PageLoading";
import ReviewOption from "../components/ReviewOption";
import { getBookmarks, removeBookmark } from "../features/bookmarks/api";
import type { BookmarkedQuestion } from "../features/bookmarks/types";
import { createBookmarksSession } from "../features/sessions/api";
import type { AnswerOption, QuestionPart } from "../features/sessions/types";
import { HTTP_UNPROCESSABLE, isApiStatusError } from "../lib/api";

type Status = "loading" | "ready" | "error";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];
const NETWORK_ERR = "החיבור נכשל. נסה שוב";
const REMOVE_ERR = "לא ניתן להסיר סימניה. נסה שוב";
const START_ERR = "לא ניתן להתחיל תרגול סימניות כרגע";
const START_EMPTY_ERR = "אין סימניות זמינות לתרגול";

const partLabel = (part: QuestionPart) => {
  if (part === "B") return "דין דיוני";
  if (part === "C") return "דין מהותי";
  return part;
};

const BookmarksPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removingStableId, setRemovingStableId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBookmarks()
      .then((data) => {
        if (cancelled) return;
        setBookmarks(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setRemoveError(null);
    setStartError(null);
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  const handleRemove = async (stableId: string) => {
    setRemoveError(null);
    setStartError(null);
    setRemovingStableId(stableId);
    try {
      await removeBookmark(stableId);
      setBookmarks((items) =>
        items.filter((item) => item.stable_id !== stableId),
      );
    } catch {
      setRemoveError(REMOVE_ERR);
    } finally {
      setRemovingStableId(null);
    }
  };

  const handlePracticeBookmarks = async () => {
    if (starting || bookmarks.length === 0) return;
    setRemoveError(null);
    setStartError(null);
    setStarting(true);
    try {
      const session = await createBookmarksSession();
      navigate(`/session/${session.id}`);
    } catch (err) {
      setStartError(
        isApiStatusError(err, HTTP_UNPROCESSABLE) ? START_EMPTY_ERR : START_ERR,
      );
    } finally {
      setStarting(false);
    }
  };

  if (status === "loading") return <PageLoading />;

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
    <div className="mx-auto w-full max-w-[720px] space-y-4 p-4 pb-28">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--accent-ink)]">
            סימניות
          </h1>
          <p className="text-sm text-stone-600">
            {bookmarks.length} שאלות שמורות
          </p>
        </div>
        <Button onClick={() => navigate("/practice/new")}>תרגול חדש</Button>
      </header>

      {removeError && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{removeError}</p>
        </Card>
      )}

      {startError && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{startError}</p>
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
          <Card className="border-[var(--accent-soft)] bg-[#fff8fd]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--accent-ink)]">
                  תרגול סימניות
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  צור סשן מכל השאלות ששמרת.
                </p>
              </div>
              <Button disabled={starting} onClick={handlePracticeBookmarks}>
                {starting ? "מתחיל…" : "התחל"}
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
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
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
                      onClick={() => handleRemove(question.stable_id)}
                    >
                      {removing ? "מסיר…" : "הסר"}
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
                    <div className="rounded-xl border border-[var(--accent-soft)] bg-[#fff8fd] p-3">
                      <p className="text-xs font-semibold text-[var(--accent)]">
                        הפניה
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-stone-800">
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
