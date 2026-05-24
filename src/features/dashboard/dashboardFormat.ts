import type { SessionSummary } from "../sessions/types";

const HEBREW_WEEKDAYS = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

export const formatHebrewDate = (d: Date) =>
  `יום ${HEBREW_WEEKDAYS[d.getDay()]}, ${d.getDate()} ב${HEBREW_MONTHS[d.getMonth()]}`;

export const greetingForHour = (h: number): string => {
  if (h < 5) return "לילה טוב";
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  if (h < 21) return "ערב טוב";
  return "לילה טוב";
};

const toNumber = (
  raw: number | string | null | undefined,
): number | null => {
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === "string" ? Number(raw) : raw;
  return Number.isNaN(n) ? null : n;
};

export const formatPercent = (
  raw: number | string | null | undefined,
): string => {
  const n = toNumber(raw);
  return n === null ? "—" : `${Math.round(n)}%`;
};

export const sessionModeLabel = (session: SessionSummary): string => {
  switch (session.mode) {
    case "simulation":
      return "מבחן מלא";
    case "exam":
      return `בחינת מועד${session.exam_date ? ` ${session.exam_date}` : ""}`;
    case "practice":
      if (session.part === "B") return "דין דיוני";
      if (session.part === "C") return "דין מהותי";
      return "תרגול";
    case "mistakes":
      return "חזרה על טעויות";
    case "bookmarks":
      return "חזרה על סימניות";
    default:
      return "תרגול";
  }
};
