import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { RingScore } from "@/components/RingScore";
import { lifestyleScore, level, xpToNext, healthAge } from "@/lib/health";
import { Flame, Sparkles, Droplet, Footprints, Quote, HeartHandshake, Star, Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

type Plan = {
  mission: string; quote: string; tinyHabit: string;
  walkMinutes: number; waterCups: number; affirmation: string;
};

const FALLBACK_AR: Plan = {
  mission: "امشي ١٥ دقيقة بعد الغداء 🌿",
  quote: "صحتك رحلة، وكل خطوة صغيرة تُحسب.",
  tinyHabit: "كوب ماء قبل كل وجبة",
  walkMinutes: 15, waterCups: 8,
  affirmation: "أنتِ تبنين نسخة أفضل من نفسك، خطوة بخطوة.",
};
const FALLBACK_EN: Plan = {
  mission: "A gentle 15-minute walk after lunch 🌿",
  quote: "Health is a journey — every small step counts.",
  tinyHabit: "A glass of water before each meal",
  walkMinutes: 15, waterCups: 8,
  affirmation: "You are building a stronger version of yourself, step by step.",
};

function Home() {
  const nav = useNavigate();
  const { t, lang } = useT();
  const profile = useApp((s) => s.profile);
  const today = useApp((s) => s.getToday());
  const xp = useApp((s) => s.xp);
  const streak = useApp((s) => s.streak);
  const plans = useApp((s) => s.plans);
  const savePlan = useApp((s) => s.savePlan);

  useEffect(() => { if (!profile) nav({ to: "/onboarding" }); }, [profile, nav]);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const todayKey = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!profile) return;
    const cached = plans[todayKey];
    if (cached) { setPlan(cached); return; }
    setLoadingPlan(true);
    const controller = new AbortController();
    // Never let the home screen spin forever: if the AI call hasn't
    // answered within 10s (rate limit, no credits, network issue, etc.),
    // abort it and fall back to a default plan instead of hanging.
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    fetch("/api/daily-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang, profile, phase: "morning" }),
      signal: controller.signal,
    })
      .then(async (r) => (r.ok ? ((await r.json()) as Plan) : (lang === "ar" ? FALLBACK_AR : FALLBACK_EN)))
      .then((p) => {
        const full = { ...(lang === "ar" ? FALLBACK_AR : FALLBACK_EN), ...p };
        setPlan(full);
        savePlan({ ...full, date: todayKey });
      })
      .catch(() => setPlan(lang === "ar" ? FALLBACK_AR : FALLBACK_EN))
      .finally(() => {
        clearTimeout(timeoutId);
        setLoadingPlan(false);
      });
  }, [profile, lang, todayKey]); // eslint-disable-line

  if (!profile) return null;

  const hour = new Date().getHours();
  const greeting = hour < 18 ? t.goodMorning : t.goodEvening;
  const life = lifestyleScore(today);
  const lv = level(xp);
  const prog = xpToNext(xp);
  const hAge = healthAge(profile, life);

  return (
    <AppShell>
      <div className="mb-5">
        <p className="text-xs text-muted-foreground">{greeting} ✨</p>
        <h1 className="font-display text-3xl text-foreground mt-0.5">
          {profile.name || (lang === "ar" ? "جميلة" : "beautiful")}
        </h1>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-primary text-primary-foreground p-5 shadow-glow">
        <div className="absolute -top-8 -end-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs opacity-80 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> {t.todaysMission}
          </div>
          <p className="mt-2 font-display text-xl leading-snug">
            {loadingPlan ? <span className="inline-flex items-center gap-2 opacity-70"><Loader2 className="w-4 h-4 animate-spin" />…</span> : plan?.mission}
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-3 py-1"><Footprints className="w-3 h-3" /> <span className="num">{plan?.walkMinutes ?? 15}</span> {lang === "ar" ? "د" : "min"}</span>
            <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-3 py-1"><Droplet className="w-3 h-3" /> <span className="num">{plan?.waterCups ?? 8}</span> {lang === "ar" ? "أكواب" : "cups"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="rounded-2xl bg-card shadow-soft p-3 text-center">
          <Flame className="w-4 h-4 text-primary mx-auto" />
          <div className="font-display text-2xl text-foreground num mt-1">{streak}</div>
          <div className="text-[10px] text-muted-foreground">{t.streak}</div>
        </div>
        <div className="rounded-2xl bg-card shadow-soft p-3 text-center">
          <Star className="w-4 h-4 text-primary mx-auto" />
          <div className="font-display text-2xl text-foreground num mt-1">{lv}</div>
          <div className="text-[10px] text-muted-foreground">{t.level}</div>
          <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary" style={{ width: `${prog.pct}%` }} />
          </div>
        </div>
        <div className="rounded-2xl bg-card shadow-soft p-3 text-center">
          <HeartHandshake className="w-4 h-4 text-primary mx-auto" />
          <div className="font-display text-2xl text-foreground num mt-1">{hAge}</div>
          <div className="text-[10px] text-muted-foreground">{t.healthAge}</div>
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-4 mt-4 items-center p-4 rounded-3xl bg-card shadow-soft">
        <RingScore value={life} label={t.lifestyleScore} size={104} />
        <div>
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
            <Quote className="w-3 h-3" /> {t.dailyQuote}
          </div>
          <p className="mt-1 text-sm text-foreground leading-relaxed">{plan?.quote}</p>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-3xl bg-gradient-hero shadow-soft">
        <div className="text-xs text-primary font-semibold mb-1">{t.tinyHabit}</div>
        <p className="text-foreground">{plan?.tinyHabit}</p>
      </div>

      <div className="mt-4 mb-4 p-4 rounded-2xl bg-accent/50 text-center">
        <p className="text-sm text-accent-foreground italic">"{plan?.affirmation}"</p>
      </div>
    </AppShell>
  );
}
