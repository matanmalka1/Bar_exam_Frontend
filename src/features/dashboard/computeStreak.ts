import type { SessionSummary } from "../sessions/types";

export interface WeekDay {
  /** "ב", "ג", … "ש", "א" */
  label: string;
  /** ISO date string yyyy-mm-dd */
  date: string;
  active: boolean;
  isToday: boolean;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  weekDays: WeekDay[];
  activeDaysThisWeek: number;
}

// Sunday = 0 in JS; Hebrew short labels Sun→Sat
const HE_DAY = ["א", "ב", "ג", "ד", "ה", "ו", "ש"] as const;

const toDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Returns a Set of yyyy-mm-dd strings on which at least one session was completed. */
const buildActiveDaySet = (sessions: SessionSummary[]): Set<string> => {
  const set = new Set<string>();
  for (const s of sessions) {
    if (!s.completed_at) continue;
    set.add(toDateKey(new Date(s.completed_at)));
  }
  return set;
};

/** Days of the current ISO week (Mon-Sun), ordered Mon→Sun. */
const currentWeekDays = (today: Date): Date[] => {
  const dow = today.getDay(); // 0=Sun
  // shift so Monday=0
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return d;
  });
};

const computeCurrentStreak = (activeDays: Set<string>, today: Date): number => {
  let streak = 0;
  const cursor = new Date(today);
  // if today has no activity, check yesterday first (streak might still be alive)
  if (!activeDays.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!activeDays.has(toDateKey(cursor))) return 0;
  }
  while (activeDays.has(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const computeLongestStreak = (activeDays: Set<string>): number => {
  if (activeDays.size === 0) return 0;
  const sorted = [...activeDays].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return longest;
};

export const computeStreak = (
  sessions: SessionSummary[],
  today = new Date(),
): StreakResult => {
  const activeDays = buildActiveDaySet(sessions);
  const todayKey = toDateKey(today);
  const weekDates = currentWeekDays(today);

  const weekDays: WeekDay[] = weekDates.map((d) => {
    const key = toDateKey(d);
    return {
      label: HE_DAY[d.getDay()],
      date: key,
      active: activeDays.has(key),
      isToday: key === todayKey,
    };
  });

  const activeDaysThisWeek = weekDays.filter((d) => d.active).length;

  return {
    currentStreak: computeCurrentStreak(activeDays, today),
    longestStreak: computeLongestStreak(activeDays),
    weekDays,
    activeDaysThisWeek,
  };
};
