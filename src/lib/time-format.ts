export const formatStudyTime = (seconds: number): string => {
  if (seconds === 0) return "—";
  if (seconds < 60) return "פחות מדקה";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes} דק׳`;
  if (minutes === 0) return `${hours} שע׳`;
  return `${hours}:${String(minutes).padStart(2, "0")} שע׳`;
};

export const formatOptionalDuration = (seconds: number | null): string => {
  if (seconds === null || seconds <= 0) return "";
  return formatStudyTime(seconds);
};
