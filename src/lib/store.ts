import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Profile = {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  waistCm: number;
  goal: string;
  activity: number;
  foods: string;
  motivation: number;
  createdAt: string;
};

export type DailyLog = {
  date: string;
  waterCups: number;
  steps: number;
  sleepHours: number;
  mood: number;
  energy: number;
  proteins: boolean;
  veggies: boolean;
  fruit: boolean;
  exercise: boolean;
  meditation: boolean;
  weightKg?: number;
  waistCm?: number;
};

export type DailyPlan = {
  date: string;
  mission: string;
  quote: string;
  tinyHabit: string;
  walkMinutes: number;
  waterCups: number;
  affirmation: string;
};

export type ChatMsg = { role: "user" | "assistant"; content: string };

type State = {
  profile: Profile | null;
  logs: Record<string, DailyLog>;
  plans: Record<string, DailyPlan>;
  xp: number;
  streak: number;
  lastActive: string | null;
  chat: ChatMsg[];
  setProfile: (p: Profile) => void;
  getToday: () => DailyLog;
  updateToday: (patch: Partial<DailyLog>) => void;
  addXp: (n: number) => void;
  bumpStreak: () => void;
  savePlan: (p: DailyPlan) => void;
  appendChat: (m: ChatMsg) => void;
  updateLastChat: (content: string) => void;
  resetChat: () => void;
  reset: () => void;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

// IMPORTANT: this must return the SAME object reference for the same date
// across repeated calls. Returning a brand-new object every time (as the
// original code did) makes React's store subscription think the data
// changed on every read, causing an infinite re-render loop and crashing
// the app with "Maximum update depth exceeded" (React error #185) — this
// is exactly what happened right after onboarding for new users who don't
// have a log entry for today yet.
let cachedEmptyLogDate: string | null = null;
let cachedEmptyLog: DailyLog | null = null;

const emptyLog = (date: string): DailyLog => {
  if (cachedEmptyLogDate === date && cachedEmptyLog) return cachedEmptyLog;
  cachedEmptyLog = {
    date, waterCups: 0, steps: 0, sleepHours: 0, mood: 3, energy: 3,
    proteins: false, veggies: false, fruit: false, exercise: false, meditation: false,
  };
  cachedEmptyLogDate = date;
  return cachedEmptyLog;
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      profile: null,
      logs: {},
      plans: {},
      xp: 0,
      streak: 0,
      lastActive: null,
      chat: [],
      setProfile: (profile) => set({ profile }),
      getToday: () => {
        const d = todayISO();
        return get().logs[d] ?? emptyLog(d);
      },
      updateToday: (patch) => {
        const d = todayISO();
        const cur = get().logs[d] ?? emptyLog(d);
        set({ logs: { ...get().logs, [d]: { ...cur, ...patch } } });
      },
      addXp: (n) => set({ xp: get().xp + n }),
      bumpStreak: () => {
        const d = todayISO();
        const last = get().lastActive;
        if (last === d) return;
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        set({ streak: last === yesterday ? get().streak + 1 : 1, lastActive: d });
      },
      savePlan: (p) => set({ plans: { ...get().plans, [p.date]: p } }),
      appendChat: (m) => set({ chat: [...get().chat, m] }),
      updateLastChat: (content) => {
        const chat = [...get().chat];
        if (chat.length && chat[chat.length - 1].role === "assistant") {
          chat[chat.length - 1] = { role: "assistant", content };
          set({ chat });
        }
      },
      resetChat: () => set({ chat: [] }),
      reset: () => set({ profile: null, logs: {}, plans: {}, xp: 0, streak: 0, lastActive: null, chat: [] }),
    }),
    { name: "lc-app" },
  ),
);
