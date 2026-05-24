import { useEffect, useMemo, useState } from "react";
import { getExams } from "../api";
import type { ExamSummary } from "../types";

type Status = "loading" | "ready" | "error";

interface ExamDateGroup {
  exam_date: string;
  label: string;
  total: number;
}

const groupByDate = (exams: ExamSummary[]): ExamDateGroup[] => {
  const map = new Map<string, ExamDateGroup>();

  for (const exam of exams) {
    const group = map.get(exam.exam_date) ?? {
      exam_date: exam.exam_date,
      label: exam.label,
      total: 0,
    };
    group.total += exam.question_count;
    map.set(exam.exam_date, group);
  }

  return [...map.values()].sort((a, b) =>
    b.exam_date.localeCompare(a.exam_date),
  );
};

export const useExamsList = () => {
  const [status, setStatus] = useState<Status>("loading");
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

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
    setReloadKey((key) => key + 1);
  };

  return { status, exams, groups, retry };
};
