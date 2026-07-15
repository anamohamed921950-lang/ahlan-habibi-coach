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
  s += (log.exercise ? 15 : 0);
  s += (log.veggies ? 10 : 0);
  if (p) {
    const b = bmi(p);
    if (b < 25) s += 10; else if (b < 30) s += 5;
  }
  return Math.round(Math.min(s, 100));
}

export function diabetesPreventionScore(log: DailyLog, p: Profile | null): number {
  let s = 35;
  s += Math.min(log.steps / 7000, 1) * 20;
  s += (log.veggies ? 12 : 0) + (log.proteins ? 8 : 0);
  s += (log.exercise ? 12 : 0);
  s += Math.min(log.sleepHours / 7, 1) * 8;
  if (p) {
    const b = bmi(p);
    if (b < 25) s += 5; else if (b < 30) s += 0; else s -= 3;
    if (p.waistCm && p.waistCm < 88) s += 5;
  }
  return Math.round(Math.max(0, Math.min(s, 100)));
}

export function healthAge(p: Profile | null, life: number): number {
  if (!p) return 0;
  const delta = (50 - life) / 5;
  return Math.max(18, Math.round(p.age + delta));
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