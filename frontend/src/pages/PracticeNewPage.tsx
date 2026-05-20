import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ActionCard from "../components/ActionCard";
import Button from "../components/Button";
import Card from "../components/Card";
import Chip from "../components/Chip";
import ErrorState from "../components/ErrorState";
import { getExams } from "../features/exams/api";
import type { ExamSummary } from "../features/exams/types";
import {
  createExamSession,
  createPracticeSession,
} from "../features/sessions/api";
import type { QuestionPart } from "../features/sessions/types";
import {
  getApiErrorDetail,
  HTTP_UNPROCESSABLE,
  isApiStatusError,
} from "../lib/api";

type Status = "loading" | "ready" | "error";
type PartChoice = QuestionPart | "both";
type CountChoice = 10 | 20 | 40 | "all";

const NETWORK_ERR = "לא ניתן להתחיל תרגול כרגע";
const DEFAULT_422 = "לא ניתן להתחיל תרגול כרגע";
const ERR_INSUFFICIENT = "אין מספיק שאלות זמינות לצירוף הזה";
const ERR_NEED_DATE = "צריך לבחור מועד בחינה";
const ERR_COUNT_EXCEEDS = "אין מספיק שאלות לכמות שבחרת";

const map422 = (raw: unknown): string => {
  const text = typeof raw === "string" ? raw : JSON.stringify(raw ?? "");
  const lower = text.toLowerCase();
  if (lower.includes("exam") && lower.includes("date")) return ERR_NEED_DATE;
  if (lower.includes("exceed") || lower.includes("too many"))
    return ERR_COUNT_EXCEEDS;
  if (
    lower.includes("insufficient") ||
    lower.includes("not enough") ||
    lower.includes("no questions")
  ) {
    return ERR_INSUFFICIENT;
  }
  return DEFAULT_422;
};

const extractApiError = (err: unknown): string => {
  if (isApiStatusError(err, HTTP_UNPROCESSABLE))
    return map422(getApiErrorDetail(err));
  return NETWORK_ERR;
};

interface ExamDateGroup {
  exam_date: string;
  label: string;
  total: number;
}

const groupByDate = (exams: ExamSummary[]): ExamDateGroup[] => {
  const map = new Map<string, ExamDateGroup>();
  for (const e of exams) {
    const g = map.get(e.exam_date) ?? {
      exam_date: e.exam_date,
      label: e.label,
      total: 0,
    };
    g.total += e.question_count;
    map.set(e.exam_date, g);
  }
  return [...map.values()].sort((a, b) =>
    b.exam_date.localeCompare(a.exam_date),
  );
};

const partToApi = (p: PartChoice): QuestionPart | null =>
  p === "both" ? null : p;

const PracticeNewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flow: "practice" | "exam" =
    searchParams.get("flow") === "exam" ? "exam" : "practice";

  const [status, setStatus] = useState<Status>("loading");
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const [part, setPart] = useState<PartChoice | null>(null);
  const [examDate, setExamDate] = useState<string | null>(null);
  const [allDates, setAllDates] = useState(false);
  const [count, setCount] = useState<CountChoice | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getExams()
      .then((data) => {
        if (cancelled) return;
        setExams(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const groups = useMemo(() => groupByDate(exams), [exams]);

  const retry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };
  const goBack = () => navigate(-1);

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <p className="text-stone-600">טוען...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <ErrorState
          message="לא ניתן לטעון את רשימת המועדים"
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </div>
    );
  }

  if (flow === "exam") {
    const canSubmit = examDate !== null && !submitting;
    const disabledReason = !examDate ? "בחר מועד בחינה" : null;

    const handleStartExam = async () => {
      if (!examDate) return;
      setSubmitError(null);
      setSubmitting(true);
      try {
        const s = await createExamSession(examDate);
        navigate(`/session/${s.id}/exam`);
      } catch (err) {
        setSubmitError(extractApiError(err));
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="mx-auto w-full max-w-[720px] p-4 pb-28 space-y-4">
        <header className="flex items-center justify-between">
          <Button variant="ghost" onClick={goBack}>
            ביטול
          </Button>
          <h1 className="font-display text-2xl font-bold text-[var(--accent-ink)]">
            בחינת מועד
          </h1>
          <span className="w-16" />
        </header>

        {submitError && (
          <Card className="border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{submitError}</p>
          </Card>
        )}

        <section className="space-y-2">
          <p className="text-sm font-semibold text-stone-700">בחר מועד</p>
          {groups.length === 0 ? (
            <Card>
              <p className="text-sm text-stone-600">אין מועדים זמינים</p>
            </Card>
          ) : (
            <div className="grid gap-2">
              {groups.map((g) => {
                const selected = examDate === g.exam_date;
                return (
                  <ActionCard
                    key={g.exam_date}
                    onClick={() => setExamDate(g.exam_date)}
                    aria-pressed={selected}
                    selected={selected}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--accent-ink)]">
                        {g.label}
                      </span>
                      <span className="text-sm text-stone-600">
                        {g.total} שאלות
                      </span>
                    </div>
                  </ActionCard>
                );
              })}
            </div>
          )}
        </section>

        <div className="fixed inset-x-0 bottom-0 border-t border-[#e2d5c2] bg-white/90 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-10px_30px_rgba(79,31,64,0.08)] backdrop-blur">
          <div className="mx-auto w-full max-w-[720px] space-y-1">
            <Button fullWidth disabled={!canSubmit} onClick={handleStartExam}>
              {submitting ? "מתחיל…" : "התחל בחינה"}
            </Button>
            {disabledReason && (
              <p className="text-center text-xs text-stone-500">
                {disabledReason}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const step = part === null ? 1 : !examDate && !allDates ? 2 : 3;
  const canSubmit =
    part !== null &&
    (examDate !== null || allDates) &&
    count !== null &&
    !submitting;

  let disabledReason: string | null = null;
  if (part === null) disabledReason = "בחר חלק";
  else if (!examDate && !allDates) disabledReason = "בחר מועד";
  else if (count === null) disabledReason = "בחר מספר שאלות";

  const handleStartPractice = async () => {
    if (!canSubmit || part === null || count === null) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload: {
        part?: QuestionPart | null;
        exam_date?: string;
        question_count?: number;
      } = {
        part: partToApi(part),
      };
      if (!allDates && examDate) payload.exam_date = examDate;
      if (count !== "all") payload.question_count = count;
      const s = await createPracticeSession(payload);
      navigate(`/session/${s.id}`);
    } catch (err) {
      setSubmitError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 pb-28 space-y-4">
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={goBack}>
          ביטול
        </Button>
        <h1 className="font-display text-2xl font-bold text-[var(--accent-ink)]">
          תרגול חופשי
        </h1>
        <span className="w-16" />
      </header>

      <p className="text-center text-xs font-medium text-[var(--accent)]">
        שלב {step} מתוך 3
      </p>

      {submitError && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{submitError}</p>
        </Card>
      )}

      <section className="space-y-2">
        <p className="text-sm font-semibold text-stone-700">בחר חלק</p>
        <div className="flex flex-wrap gap-2">
          <Chip selected={part === "B"} onClick={() => setPart("B")}>
            דין דיוני
          </Chip>
          <Chip selected={part === "C"} onClick={() => setPart("C")}>
            דין מהותי
          </Chip>
          <Chip selected={part === "both"} onClick={() => setPart("both")}>
            שני החלקים יחד
          </Chip>
        </div>
      </section>

      {part !== null && (
        <section className="space-y-2">
          <p className="text-sm font-semibold text-stone-700">בחר מועד</p>
          <div className="flex flex-wrap gap-2">
            <Chip
              selected={allDates}
              onClick={() => {
                setAllDates(true);
                setExamDate(null);
              }}
            >
              כל המועדים
            </Chip>
            {groups.map((g) => (
              <Chip
                key={g.exam_date}
                selected={!allDates && examDate === g.exam_date}
                onClick={() => {
                  setAllDates(false);
                  setExamDate(g.exam_date);
                }}
              >
                {g.label}
              </Chip>
            ))}
          </div>
        </section>
      )}

      {part !== null && (examDate !== null || allDates) && (
        <section className="space-y-2">
          <p className="text-sm font-semibold text-stone-700">מספר שאלות</p>
          <div className="flex flex-wrap gap-2">
            {([10, 20, 40] as const).map((n) => (
              <Chip key={n} selected={count === n} onClick={() => setCount(n)}>
                {n}
              </Chip>
            ))}
            <Chip selected={count === "all"} onClick={() => setCount("all")}>
              כל השאלות
            </Chip>
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-[#e2d5c2] bg-white/90 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-10px_30px_rgba(79,31,64,0.08)] backdrop-blur">
        <div className="mx-auto w-full max-w-[720px] space-y-1">
          <Button fullWidth disabled={!canSubmit} onClick={handleStartPractice}>
            {submitting ? "מתחיל…" : "התחל תרגול"}
          </Button>
          {disabledReason && (
            <p className="text-center text-xs text-stone-500">
              {disabledReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeNewPage;
