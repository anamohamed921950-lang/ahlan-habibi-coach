import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import type { WeekDayPlan } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { lifestyleScore, level, xpToNext } from "@/lib/health";
import { Droplet, Footprints, Loader2, Sparkles, CalendarDays, ArrowLeft, RefreshCw, Flame, Target, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/plan")({ component: PlanPage });

function mondayISO(d = new Date()): string {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

const FALLBACK_AR: WeekDayPlan[] = [
  { day: "الاثنين", mission: "امشي ١٠ دقائق بعد أي وجبة", tinyHabit: "كوب ماء عند الاستيقاظ", walkMinutes: 10, waterCups: 6 },
  { day: "الثلاثاء", mission: "أضيفي طبق خضار لوجبة واحدة", tinyHabit: "٥ دقائق تنفس هادئ", walkMinutes: 15, waterCups: 8 },
  { day: "الأربعاء", mission: "نامي ٣٠ دقيقة أبكر الليلة", tinyHabit: "بدون شاشة قبل النوم بساعة", walkMinutes: 15, waterCups: 8 },
  { day: "الخميس", mission: "امشي ٢٠ دقيقة اليوم", tinyHabit: "وجبة غنية بالبروتين", walkMinutes: 20, waterCups: 8 },
  { day: "الجمعة", mission: "يوم راحة لطيف، حركة خفيفة فقط", tinyHabit: "اتصلي بصديقة تحبينها", walkMinutes: 10, waterCups: 7 },
  { day: "السبت", mission: "جربي وجبة صحية جديدة", tinyHabit: "دوّني ٣ أشياء ممتنة لها", walkMinutes: 15, waterCups: 8 },
  { day: "الأحد", mission: "احتفلي بإنجازات أسبوعك", tinyHabit: "خططي لأسبوع جديد بلطف", walkMinutes: 15, waterCups: 8 },
];
const FALLBACK_EN: WeekDayPlan[] = [
  { day: "Mon", mission: "A gentle 10-minute walk after any meal", tinyHabit: "One glass of water on waking", walkMinutes: 10, waterCups: 6 },
  { day: "Tue", mission: "Add one veggie-rich plate today", tinyHabit: "5 minutes of calm breathing", walkMinutes: 15, waterCups: 8 },
  { day: "Wed", mission: "Sleep 30 minutes earlier tonight", tinyHabit: "No screens 1 hour before bed", walkMinutes: 15, waterCups: 8 },
  { day: "Thu", mission: "A 20-minute walk today", tinyHabit: "One protein-rich meal", walkMinutes: 20, waterCups: 8 },
  { day: "Fri", mission: "A gentle rest day, light movement only", tinyHabit: "Call a friend you love", walkMinutes: 10, waterCups: 7 },
  { day: "Sat", mission: "Try one new healthy recipe", tinyHabit: "Write down 3 things you're grateful for", walkMinutes: 15, waterCups: 8 },
  { day: "Sun", mission: "Celebrate this week's wins", tinyHabit: "Gently plan the week ahead", walkMinutes: 15, waterCups: 8 },
];

function PlanPage() {
  const { t, lang } = useT();
  const router = useRouter();
  const profile = useApp((s) => s.profile);
  const logs = useApp((s) => s.logs);
  const lastMeal = useApp((s) => s.lastMeal);
  const xp = useApp((s) => s.xp);
  const streak = useApp((s) => s.streak);
  const weeklyPlans = useApp((s) => s.weeklyPlans);
  const saveWeeklyPlan = useApp((s) => s.saveWeeklyPlan);

  const weekKey = mondayISO();
  const [week, setWeek] = useState<WeekDayPlan[] | null>(weeklyPlans[weekKey]?.days ?? null);
  const [loading, setLoading] = useState(false);
  const [openIdx, setOpenIdx] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  const generate = useCallback((force = false) => {
    if (!profile) return;
    if (!force && week) return;
    const recentLogs = Object.keys(logs).sort().slice(-7).map((k) => logs[k]);
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    fetch("/api/weekly-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang, profile, recentLogs, lastMeal }),
      signal: controller.signal,
    })
      .then(async (r) => {
        const fb = lang === "ar" ? FALLBACK_AR : FALLBACK_EN;
        if (!r.ok) return fb;
        const data = (await r.json()) as { days?: WeekDayPlan[] };
        return data.days && data.days.length === 7 ? data.days : fb;
      })
      .then((days) => {
        setWeek(days);
        saveWeeklyPlan({ weekStart: weekKey, days });
      })
      .catch(() => setWeek(lang === "ar" ? FALLBACK_AR : FALLBACK_EN))
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });
  }, [profile, lang, weekKey, week, saveWeeklyPlan, logs, lastMeal]);

  useEffect(() => { generate(false); }, [generate]);

  // Weekly progress: count days in current week with any activity + avg score
  const weekLogs = Object.keys(logs)
    .filter((k) => k >= weekKey)
    .map((k) => logs[k]);
  const daysLogged = weekLogs.filter(
    (l) => l.waterCups || l.steps || l.sleepHours || l.exercise || l.veggies || l.proteins,
  ).length;
  const avgScore = weekLogs.length
    ? Math.round(weekLogs.reduce((s, l) => s + lifestyleScore(l), 0) / weekLogs.length)
    : 0;
  const completionPct = Math.round((daysLogged / 7) * 100);
  const lv = level(xp);
  const prog = xpToNext(xp);

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const todayPlan = week?.[todayIdx];

  const monday = new Date(weekKey);
  const rangeStr = (() => {
    const end = new Date(monday);
    end.setDate(monday.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    const loc = lang === "ar" ? "ar-EG" : "en-US";
    return `${monday.toLocaleDateString(loc, opts)} — ${end.toLocaleDateString(loc, opts)}`;
  })();

  return (
    <AppShell>
      <div className="mb-4 flex items-start gap-3 animate-fade-up">
        <button
          onClick={() => router.history.back()}
          className="w-10 h-10 rounded-full bg-card border border-border shadow-soft flex items-center justify-center text-foreground shrink-0"
          aria-label={t.back}
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-widest text-primary/70 font-semibold inline-flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" /> {t.weekPlan}
          </div>
          <h1 className="font-display text-3xl text-foreground mt-1 leading-none">{t.plan}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{rangeStr}</p>
        </div>
        <button
          onClick={() => generate(true)}
          disabled={loading}
          className="h-10 px-3 rounded-full bg-card border border-border shadow-soft inline-flex items-center gap-1.5 text-xs text-primary font-semibold disabled:opacity-50"
          aria-label={t.regenerate}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{loading ? t.regenerating : t.regenerate}</span>
        </button>
      </div>

      {/* Weekly progress */}
      <section className="mb-4 p-4 rounded-3xl bg-card border border-border shadow-soft animate-fade-up">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
          {t.weeklyProgress}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <ProgTile label={t.streak} value={streak} icon={<Flame className="w-3.5 h-3.5" />} />
          <ProgTile label={t.daysLogged} value={`${daysLogged}/7`} icon={<Target className="w-3.5 h-3.5" />} />
          <ProgTile label={t.avgScore} value={avgScore} icon={<Sparkles className="w-3.5 h-3.5" />} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>{t.level} {lv}</span>
          <span className="num">{xp} {t.xp}</span>
        </div>
        <div className="h-1.5 bg-secondary/70 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-gold transition-all duration-700" style={{ width: `${completionPct || prog.pct}%` }} />
        </div>
      </section>

      {/* Next action */}
      {todayPlan ? (
        <Link to="/habits" className="block mb-4 p-4 rounded-3xl bg-gradient-sunset text-primary-foreground shadow-glow animate-fade-up">
          <div className="text-[10px] uppercase tracking-widest opacity-90 font-semibold inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> {t.nextAction}
          </div>
          <p className="mt-1.5 font-display text-lg leading-snug text-balance">{todayPlan.mission}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] opacity-90">
            <span>{todayPlan.tinyHabit}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </div>
        </Link>
      ) : null}

      {(Object.keys(logs).length > 0 || lastMeal) && (
        <div className="mb-3 text-[10px] text-primary/70 font-semibold inline-flex items-center gap-1 px-1">
          <Sparkles className="w-3 h-3" /> {t.personalizedFor}
        </div>
      )}

      {loading && !week ? (
        <div className="p-8 rounded-3xl bg-card border border-border flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          {lang === "ar" ? "جارٍ تحضير أسبوعك..." : "Preparing your week..."}
        </div>
      ) : (
        <div className="space-y-3">
          {(week ?? (lang === "ar" ? FALLBACK_AR : FALLBACK_EN)).map((d, i) => {
            const open = openIdx === i;
            return (
              <div
                key={i}
                className={`rounded-3xl border transition-all overflow-hidden animate-fade-up ${open ? "bg-card border-primary/40 shadow-glow" : "bg-card/60 border-border hover:border-primary/30"}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <button onClick={() => setOpenIdx(open ? -1 : i)} className="w-full text-start p-4 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-display text-lg ${open ? "bg-gradient-primary text-primary-foreground shadow-soft" : "bg-secondary text-primary"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] uppercase tracking-widest text-primary font-semibold">{d.day}</div>
                    <p className={`text-sm mt-0.5 leading-snug ${open ? "text-foreground" : "text-muted-foreground line-clamp-2"}`}>{d.mission}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0">
                    <span className="inline-flex items-center gap-0.5">
                      <Footprints className="w-3 h-3" />
                      <span className="num">{d.walkMinutes}</span>
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Droplet className="w-3 h-3" />
                      <span className="num">{d.waterCups}</span>
                    </span>
                  </div>
                </button>
                {open ? (
                  <div className="px-4 pb-4 pt-0 border-t border-border/50 mt-1">
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Stat icon={<Footprints className="w-4 h-4" />} label={t.walkGoal}>
                        <span className="num">{d.walkMinutes}</span> {t.minutes}
                      </Stat>
                      <Stat icon={<Droplet className="w-4 h-4" />} label={t.waterGoal}>
                        <span className="num">{d.waterCups}</span> {t.cups}
                      </Stat>
                    </div>
                    <div className="mt-3 p-3 rounded-2xl bg-accent/40 border border-accent/40 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-accent-foreground mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-accent-foreground/70 font-semibold">{t.tinyHabit}</div>
                        <p className="text-sm text-accent-foreground leading-snug mt-0.5">{d.tinyHabit}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function ProgTile({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="p-2.5 rounded-2xl bg-secondary/60 text-center">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold inline-flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 font-display text-xl text-primary num">{value}</div>
    </div>
  );
}

function Stat({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded-2xl bg-secondary/60">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold inline-flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display text-xl text-primary">{children}</div>
    </div>
  );
}