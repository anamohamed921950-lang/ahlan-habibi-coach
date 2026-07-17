import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import type { WeekDayPlan } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Droplet, Footprints, Loader2, Sparkles, CalendarDays } from "lucide-react";

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
  const profile = useApp((s) => s.profile);
  const weeklyPlans = useApp((s) => s.weeklyPlans);
  const saveWeeklyPlan = useApp((s) => s.saveWeeklyPlan);

  const weekKey = mondayISO();
  const [week, setWeek] = useState<WeekDayPlan[] | null>(weeklyPlans[weekKey]?.days ?? null);
  const [loading, setLoading] = useState(false);
  const [openIdx, setOpenIdx] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  useEffect(() => {
    if (!profile || week) return;
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    fetch("/api/weekly-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang, profile }),
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
  }, [profile, lang, weekKey, week, saveWeeklyPlan]);

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
      <div className="mb-6 animate-fade-up">
        <div className="text-[11px] uppercase tracking-widest text-primary/70 font-semibold inline-flex items-center gap-1.5">
          <CalendarDays className="w-3 h-3" /> {t.weekPlan}
        </div>
        <h1 className="font-display text-4xl text-foreground mt-1 leading-none">{t.plan}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{rangeStr}</p>
      </div>

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