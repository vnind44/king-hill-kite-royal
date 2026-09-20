export const PALETTE = {
  light: {
    primary: "#2563EB",
    primaryDark: "#1E3A8A",
    teal: "#0D9488",
    amber: "#F59E0B",
    success: "#16A34A",
    error: "#DC2626",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
    secondaryText: "#64748B",
  },
  dark: {
    background: "#0F172A",
    surface: "#1E293B",
    primary: "#60A5FA",
    secondary: "#2DD4BF",
    accent: "#FBBF24",
    text: "#F8FAFC",
    secondaryText: "#94A3B8",
  },
} as const;

function channel(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  return [
    parseInt(n.slice(0, 2), 16) / 255,
    parseInt(n.slice(2, 4), 16) / 255,
    parseInt(n.slice(4, 6), 16) / 255,
  ];
}

function linear(c: number): number {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = channel(hex);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(fg: string, bg: string): number {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isWcagAa(fg: string, bg: string, large = false): boolean {
  return contrastRatio(fg, bg) >= (large ? 3 : 4.5);
}
