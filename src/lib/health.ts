import type { DailyLog, Profile } from "./store";

export function bmi(p: Profile) {
  const m = p.heightCm / 100;
  return p.weightKg / (m * m);
}

export function lifestyleScore(log: DailyLog): number {
  let s = 0;
  s += Math.min(log.waterCups / 8, 1) * 20;
  s += Math.min(log.steps / 7000, 1) * 25;
  s += Math.min(log.sleepHours / 7, 1) * 20;
  s += (log.proteins ? 5 : 0) + (log.veggies ? 8 : 0) + (log.fruit ? 4 : 0);
  s += (log.exercise ? 10 : 0) + (log.meditation ? 4 : 0);
  s += ((log.mood - 1) / 4) * 4;
  return Math.round(Math.min(s, 100));
}

export function heartScore(log: DailyLog, p: Profile | null): number {
  let s = 40;
  s += Math.min(log.steps / 7000, 1) * 25;
  s += log.exercise ? 15 : 0;
  s += log.veggies ? 10 : 0;
  if (p) {
    const b = bmi(p);
    if (b < 25) s += 10;
    else if (b < 30) s += 5;
  }
  return Math.round(Math.min(s, 100));
}

export function diabetesPreventionScore(log: DailyLog, p: Profile | null): number {
  let s = 35;
  s += Math.min(log.steps / 7000, 1) * 20;
  s += (log.veggies ? 12 : 0) + (log.proteins ? 8 : 0);
  s += log.exercise ? 12 : 0;
  s += Math.min(log.sleepHours / 7, 1) * 8;
  if (p) {
    const b = bmi(p);
    if (b < 25) s += 5;
    else if (b < 30) s += 0;
    else s -= 3;
    if (p.waistCm && p.waistCm < 88) s += 5;
  }
  return Math.round(Math.max(0, Math.min(s, 100)));
}

// Wellness trend across the last 7 days of logs. Honest, evidence-informed,
// not a fake "health age". Returns one of three states + the average.
export type WellnessTrend = "improving" | "steady" | "care";

export function wellnessTrend(logs: Record<string, DailyLog>): {
  trend: WellnessTrend;
  avg: number;
  days: number;
} {
  const keys = Object.keys(logs).sort().slice(-7);
  if (keys.length === 0) return { trend: "steady", avg: 0, days: 0 };
  const scores = keys.map((k) => lifestyleScore(logs[k]));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const firstHalf = scores.slice(0, Math.max(1, Math.floor(scores.length / 2)));
  const secondHalf = scores.slice(-Math.max(1, Math.floor(scores.length / 2)));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const delta = secondAvg - firstAvg;
  let trend: WellnessTrend = "steady";
  if (delta > 4 || avg >= 65) trend = "improving";
  else if (avg < 35) trend = "care";
  return { trend, avg: Math.round(avg), days: keys.length };
}

export function level(xp: number): number {
  return Math.floor(Math.sqrt(xp / 20)) + 1;
}
export function xpToNext(xp: number): { current: number; next: number; pct: number } {
  const lv = level(xp);
  const cur = 20 * (lv - 1) * (lv - 1);
  const next = 20 * lv * lv;
  return { current: xp - cur, next: next - cur, pct: ((xp - cur) / (next - cur)) * 100 };
}
