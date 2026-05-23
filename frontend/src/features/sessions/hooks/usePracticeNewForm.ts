import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractApiError } from "../../../lib/api-errors";
import { notifyError } from "../../../lib/toast";
import { createExamSession, createPracticeSession } from "../api";
import type { QuestionPart } from "../types";

export type PartChoice = QuestionPart | "both";
export type CountChoice = 10 | 20 | 40 | 50 | 60 | 70 | 80;
export type PracticeNewFlow = "practice" | "exam";

const NETWORK_ERR = "לא ניתן להתחיל תרגול כרגע";

const partToApi = (part: PartChoice): QuestionPart | null =>
  part === "both" ? null : part;

export const usePracticeNewForm = (flow: PracticeNewFlow) => {
  const navigate = useNavigate();
  const [part, setPart] = useState<PartChoice | null>(null);
  const [examDate, setExamDate] = useState<string | null>(null);
  const [allDates, setAllDates] = useState(false);
  const [count, setCount] = useState<CountChoice | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      const session = await createExamSession(examDate);
      navigate(`/session/${session.id}/exam`);
    } catch (err) {
      notifyError(extractApiError(err, NETWORK_ERR));
    } finally {
      setSubmitting(false);
    }
  };

  const startPractice = async () => {
    if (!canSubmit || part === null || count === null) return;
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
      payload.question_count = count;

      const session = await createPracticeSession(payload);
      navigate(`/session/${session.id}`);
    } catch (err) {
      notifyError(extractApiError(err, NETWORK_ERR));
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
