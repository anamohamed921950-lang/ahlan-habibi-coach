import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import type { WeekDayPlan } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { lifestyleScore, level, xpToNext } from "@/lib/health";
import {
  Flame,
  Droplet,
  Footprints,
  ArrowRight,
  Loader2,
  Camera,
  MessageCircleHeart,
  Sparkles,
  Moon,
  Salad,
  Sun,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

type Plan = {
  mission: string;
  quote: string;
  tinyHabit: string;
  walkMinutes: number;
  waterCups: number;
  affirmation: string;
};

const FALLBACK_AR: Plan = {
  mission: "امشي ١٥ دقيقة بعد الغداء 🌿",
  quote: "صحتك رحلة، وكل خطوة صغيرة تُحسب.",
  tinyHabit: "كوب ماء قبل كل وجبة",
  walkMinutes: 15,
  waterCups: 8,
  affirmation: "أنتِ تبنين نسخة أفضل من نفسك، خطوة بخطوة.",
};
const FALLBACK_EN: Plan = {
  mission: "A gentle 15-minute walk after lunch 🌿",
  quote: "Health is a journey — every small step counts.",
  tinyHabit: "A glass of water before each meal",
  walkMinutes: 15,
  waterCups: 8,
  affirmation: "You are building a stronger version of yourself, step by step.",
};

function mondayISO(d = new Date()): string {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function Home() {
  const nav = useNavigate();
  const { t, lang } = useT();
  const profile = useApp((s) => s.profile);
  const today = useApp((s) => s.getToday());
  const xp = useApp((s) => s.xp);
  const streak = useApp((s) => s.streak);
  const plans = useApp((s) => s.plans);
  const savePlan = useApp((s) => s.savePlan);
  const weeklyPlans = useApp((s) => s.weeklyPlans);

  useEffect(() => {
    if (!profile) nav({ to: "/onboarding" });
  }, [profile, nav]);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const todayKey = new Date().toISOString().slice(0, 10);
  const weekKey = mondayISO();
  const week: WeekDayPlan[] | null = weeklyPlans[weekKey]?.days ?? null;

  useEffect(() => {
    if (!profile) return;
    const cached = plans[todayKey];
    if (cached) {
      setPlan(cached);
      return;
    }
    setLoadingPlan(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    fetch("/api/daily-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang, profile, phase: "morning" }),
      signal: controller.signal,
    })
      .then(async (r) =>
        r.ok ? ((await r.json()) as Plan) : lang === "ar" ? FALLBACK_AR : FALLBACK_EN,
      )
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

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 5 ? t.goodEvening : hour < 18 ? t.goodMorning : t.goodEvening;
  const life = lifestyleScore(today);
  const lv = level(xp);
  const prog = xpToNext(xp);

  const dateStr = now.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AppShell>
      <div className="mb-5 flex items-start justify-between animate-fade-up">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-primary/70 font-semibold flex items-center gap-1.5">
            {hour < 18 ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            {greeting}
          </div>
          <h1 className="font-display text-3xl text-foreground mt-1 leading-none">
            {profile.name || (lang === "ar" ? "جميلة" : "friend")}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{dateStr}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 shadow-soft">
          <Flame className="w-3.5 h-3.5 text-primary" />
          <span className="font-display text-lg text-primary num leading-none">{streak}</span>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-sunset text-primary-foreground p-6 shadow-glow animate-fade-up">
        <div className="absolute -top-16 -end-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 start-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest opacity-90 font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> {t.todaysMission}
          </div>
          <p className="mt-3 font-display text-[26px] leading-[1.15] text-balance">
            {loadingPlan ? (
              <span className="inline-flex items-center gap-2 opacity-80">
                <Loader2 className="w-5 h-5 animate-spin" />
              </span>
            ) : (
              plan?.mission
            )}
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs">
            <Pill icon={<Footprints className="w-3 h-3" />}>
              <span className="num">{plan?.walkMinutes ?? 15}</span> {t.minutes}
            </Pill>
            <Pill icon={<Droplet className="w-3 h-3" />}>
              <span className="num">{plan?.waterCups ?? 8}</span> {t.cups}
            </Pill>
          </div>
          {plan?.quote ? (
            <p className="mt-5 text-sm italic opacity-90 border-t border-white/20 pt-4 leading-relaxed">
              " {plan.quote} "
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 animate-fade-up">
        <div className="p-4 rounded-3xl bg-card border border-border shadow-soft">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              {t.lifestyleScore}
            </span>
            <span className="font-display text-2xl text-primary num">{life}</span>
          </div>
          <div className="mt-2 h-1.5 bg-secondary/70 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary transition-all duration-700" style={{ width: `${life}%` }} />
          </div>
        </div>
        <div className="p-4 rounded-3xl bg-card border border-border shadow-soft">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              {t.level}
            </span>
            <span className="font-display text-2xl text-primary num">{lv}</span>
          </div>
          <div className="mt-2 h-1.5 bg-secondary/70 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-gold transition-all duration-700" style={{ width: `${prog.pct}%` }} />
          </div>
        </div>
      </section>

      {plan?.tinyHabit ? (
        <section className="mt-4 p-4 rounded-3xl bg-accent/40 border border-accent/50 flex items-center gap-3 animate-fade-up">
          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shrink-0 shadow-soft">
            <Salad className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-accent-foreground/70 font-semibold">
              {t.tinyHabit}
            </div>
            <p className="text-sm text-accent-foreground mt-0.5 leading-snug">{plan.tinyHabit}</p>
          </div>
        </section>
      ) : null}

      <section className="mt-6 animate-fade-up">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
            {t.weekPlan}
          </div>
          <Link to="/plan" className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:opacity-80">
            {t.seeFullPlan} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {(week ?? Array(7).fill(null)).map((d: WeekDayPlan | null, i: number) => (
            <Link
              key={i}
              to="/plan"
              className="shrink-0 w-32 rounded-2xl bg-card border border-border shadow-soft p-3 hover:border-primary/50 transition-colors"
            >
              <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                {d?.day ?? (lang === "ar" ? `يوم ${i + 1}` : `Day ${i + 1}`)}
              </div>
              <p className="text-xs text-foreground leading-snug line-clamp-3 mt-1 min-h-[3rem]">
                {d?.mission ?? "…"}
              </p>
              {d ? (
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-0.5">
                    <Footprints className="w-2.5 h-2.5" />
                    {d.walkMinutes}
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <Droplet className="w-2.5 h-2.5" />
                    {d.waterCups}
                  </span>
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 animate-fade-up">
        <Link to="/coach" className="p-4 rounded-3xl bg-card border border-border shadow-soft flex items-center gap-3 hover:border-primary/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
            <MessageCircleHeart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground">{t.coach}</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {lang === "ar" ? "دردشة سريعة" : "Quick chat"}
            </div>
          </div>
        </Link>
        <Link to="/meal" className="p-4 rounded-3xl bg-card border border-border shadow-soft flex items-center gap-3 hover:border-primary/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-teal flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground">{t.meal}</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {lang === "ar" ? "صوّري وجبتك" : "Snap a meal"}
            </div>
          </div>
        </Link>
      </section>

      {plan?.affirmation ? (
        <section className="mt-6 mb-6 text-center animate-fade-up">
          <div className="rule-gold mx-auto max-w-[200px]" />
          <p className="mt-4 text-sm italic text-foreground/80 text-balance px-4">
            {plan.affirmation}
          </p>
          <div className="rule-gold mx-auto max-w-[200px] mt-4" />
        </section>
      ) : null}
    </AppShell>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/25">
      {icon}
      {children}
    </span>
  );
}