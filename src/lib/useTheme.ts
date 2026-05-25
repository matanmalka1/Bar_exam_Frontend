import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

const getStored = (): ThemePreference => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    // ignore
  }
  return "system";
};

const applyTheme = (pref: ThemePreference) => {
  const root = document.documentElement;
  if (pref === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", pref);
  }
};

export const useTheme = () => {
  const [preference, setPreference] = useState<ThemePreference>(getStored);

  useEffect(() => {
    applyTheme(preference);
  }, [preference]);

  const setTheme = useCallback((next: ThemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    setPreference(next);
  }, []);

  return { preference, setTheme };
};

// Apply stored theme immediately on module load to avoid flash
applyTheme(getStored());
