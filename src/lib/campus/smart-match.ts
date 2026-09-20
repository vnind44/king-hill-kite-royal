import type { SmartMatchResult } from "./types";

const WEIGHTS = {
  category: 0.25,
  title: 0.25,
  color: 0.15,
  location: 0.15,
  brand: 0.1,
  description: 0.1,
} as const;

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "lost",
  "found",
  "item",
  "a",
  "an",
  "of",
  "in",
  "on",
  "at",
]);

const COLOR_ALIASES: Record<string, string> = {
  navy: "blue",
  royal: "blue",
  cobalt: "blue",
  sky: "blue",
  azure: "blue",
  charcoal: "black",
  ebony: "black",
  jet: "black",
  onyx: "black",
  burgundy: "red",
  maroon: "red",
  crimson: "red",
  scarlet: "red",
  wine: "red",
  forest: "green",
  olive: "green",
  mint: "green",
  sage: "green",
  cream: "white",
  ivory: "white",
  offwhite: "white",
  beige: "tan",
  khaki: "tan",
  camel: "tan",
  gold: "yellow",
  mustard: "yellow",
  silver: "gray",
  grey: "gray",
  graphite: "gray",
  slate: "gray",
};

export type MatchableItem = {
  title: string;
  category: string;
  color?: string;
  brand?: string;
  location?: string;
  description?: string;
  itemType?: "LOST" | "FOUND";
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string): Set<string> {
  return new Set(
    normalize(value)
      .split(" ")
      .filter((t) => t.length > 2 && !STOP.has(t)),
  );
}

function jaccard(a: string, b: string): number {
  const left = tokens(a);
  const right = tokens(b);
  if (left.size === 0 && right.size === 0) return 0;
  let inter = 0;
  for (const t of left) if (right.has(t)) inter += 1;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : inter / union;
}

function exact(a: string, b: string): number {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return 0;
  return left === right ? 1 : left.includes(right) || right.includes(left) ? 0.6 : 0;
}

export function canonicalColor(value: string): string {
  const n = normalize(value).replace(/\s/g, "");
  return COLOR_ALIASES[n] ?? n;
}

function colorScore(a: string, b: string): number {
  const left = canonicalColor(a);
  const right = canonicalColor(b);
  if (!left || !right) return 0;
  return left === right ? 1 : 0;
}

function locationScore(a: string, b: string): number {
  const exactHit = exact(a, b);
  if (exactHit >= 1) return 1;
  return Math.max(exactHit, jaccard(a, b));
}

/**
 * Deterministic Smart Match. Compare a lost report against a found report
 * (or vice versa). Callers should only pair opposite types.
 */
export function scoreMatch(a: MatchableItem, b: MatchableItem): SmartMatchResult {
  const category = exact(a.category, b.category) === 1 ? 1 : 0;
  const title = jaccard(a.title, b.title);
  const color = colorScore(a.color ?? "", b.color ?? "");
  const location = locationScore(a.location ?? "", b.location ?? "");
  const brand = exact(a.brand ?? "", b.brand ?? "");
  const description = jaccard(
    `${a.description ?? ""} ${a.title}`,
    `${b.description ?? ""} ${b.title}`,
  );

  const weighted =
    category * WEIGHTS.category +
    title * WEIGHTS.title +
    color * WEIGHTS.color +
    location * WEIGHTS.location +
    brand * WEIGHTS.brand +
    description * WEIGHTS.description;

  const score = Math.max(0, Math.min(100, Math.round(weighted * 100)));

  const parts: string[] = [];
  if (category) parts.push("same category");
  if (title >= 0.4) parts.push("similar name");
  if (color) parts.push("matching color");
  if (location >= 0.4) parts.push("nearby location");
  if (brand >= 0.6) parts.push("same brand");
  if (description >= 0.3) parts.push("overlapping details");

  const explanation =
    parts.length > 0
      ? `Score ${score}% from ${parts.join(", ")}.`
      : `Score ${score}% — attributes did not strongly overlap.`;

  return {
    score,
    breakdown: {
      category: Math.round(category * WEIGHTS.category * 100),
      title: Math.round(title * WEIGHTS.title * 100),
      color: Math.round(color * WEIGHTS.color * 100),
      location: Math.round(location * WEIGHTS.location * 100),
      brand: Math.round(brand * WEIGHTS.brand * 100),
      description: Math.round(description * WEIGHTS.description * 100),
    },
    explanation,
  };
}

export const MATCH_THRESHOLD = 55;

export function shouldSurfaceMatch(result: SmartMatchResult): boolean {
  return result.score >= MATCH_THRESHOLD;
}

export function oppositeType(type: "LOST" | "FOUND"): "LOST" | "FOUND" {
  return type === "LOST" ? "FOUND" : "LOST";
}
