import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";

const KEY = "campus-theme";

function apply(theme: ThemeChoice) {
  if (typeof document === "undefined") return;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.classList.toggle("light", !dark);
}

const ThemeContext = createContext<{
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
}>({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as ThemeChoice | null;
    const next = stored === "light" || stored === "dark" || stored === "system" ? stored : "dark";
    setThemeState(next);
    apply(next);
  }, []);

  useEffect(() => {
    apply(theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply(theme);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (next: ThemeChoice) => {
        setThemeState(next);
        window.localStorage.setItem(KEY, next);
        apply(next);
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
