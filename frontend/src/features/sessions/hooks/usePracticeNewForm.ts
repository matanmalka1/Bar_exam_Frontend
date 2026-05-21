import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getApiErrorDetail,
  HTTP_UNPROCESSABLE,
  isApiStatusError,
} from "../../../lib/api";
import { createExamSession, createPracticeSession } from "../api";
import type { QuestionPart } from "../types";

export type PartChoice = QuestionPart | "both";
export type CountChoice = 10 | 20 | 40 | "all";
export type PracticeNewFlow = "practice" | "exam";

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

const partToApi = (part: PartChoice): QuestionPart | null =>
  part === "both" ? null : part;

export const usePracticeNewForm = (flow: PracticeNewFlow) => {
  const navigate = useNavigate();
  const [part, setPart] = useState<PartChoice | null>(null);
  const [examDate, setExamDate] = useState<string | null>(null);
  const [allDates, setAllDates] = useState(false);
  const [count, setCount] = useState<CountChoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dateSelected = allDates || examDate !== null;

  const canSubmit = useMemo(() => {
    if (flow === "exam") return examDate !== null && !submitting;
    return part !== null && dateSelected && count !== null && !submitting;
  }, [count, dateSelected, examDate, flow, part, submitting]);

  const disabledReason = useMemo(() => {
    if (flow === "exam") return examDate ? null : "בחר מועד בחינה";
    if (part === null) return "בחר חלק";
    if (!dateSelected) return "בחר מועד";
    if (count === null) return "בחר מספר שאלות";
    return null;
  }, [count, dateSelected, examDate, flow, part]);

  const selectAllDates = () => {
    setAllDates(true);
    setExamDate(null);
  };

  const selectExamDate = (date: string) => {
    setAllDates(false);
    setExamDate(date);
  };

  const startExam = async () => {
    if (!examDate) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const session = await createExamSession(examDate);
      navigate(`/session/${session.id}/exam`);
    } catch (err) {
      setSubmitError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const startPractice = async () => {
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

      const session = await createPracticeSession(payload);
      navigate(`/session/${session.id}`);
    } catch (err) {
      setSubmitError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    part,
    examDate,
    allDates,
    count,
    submitting,
    submitError,
    canSubmit,
    disabledReason,
    dateSelected,
    setPart,
    setCount,
    selectAllDates,
    selectExamDate,
    startExam,
    startPractice,
  };
};
