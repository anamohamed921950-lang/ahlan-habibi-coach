import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { diabetesPreventionScore, heartScore, lifestyleScore, wellnessTrend } from "@/lib/health";
import { TrendingUp, Minus, TrendingDown, Heart, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/insights")({ component: InsightsPage });

function InsightsPage() {
  const { t, lang } = useT();
  const today = useApp((s) => s.getToday());
  const profile = useApp((s) => s.profile);
  const logs = useApp((s) => s.logs);
  const streak = useApp((s) => s.streak);

  const life = lifestyleScore(today);
  const heart = heartScore(today, profile);
  const dpp = diabetesPreventionScore(today, profile);
  const trend = wellnessTrend(logs);

  const trendMeta =
    trend.trend === "improving"
      ? { label: t.trendImproving, icon: <TrendingUp className="w-5 h-5" />, cls: "bg-gradient-primary text-primary-foreground" }
      : trend.trend === "care"
        ? { label: t.trendCare, icon: <TrendingDown className="w-5 h-5" />, cls: "bg-destructive text-destructive-foreground" }
        : { label: t.trendSteady, icon: <Minus className="w-5 h-5" />, cls: "bg-gradient-gold text-accent-foreground" };

  const timeline = [
    { when: lang === "ar" ? "الأسبوع ٢" : "Week 2", what: lang === "ar" ? "طاقة أفضل، مزاج أهدأ" : "More energy, calmer mood" },
    { when: lang === "ar" ? "الشهر ١" : "Month 1", what: lang === "ar" ? "خصر أرق، نوم أعمق" : "Trimmer waist, deeper sleep" },
    { when: lang === "ar" ? "الشهر ٣" : "Month 3", what: lang === "ar" ? "سكر أفضل، لياقة أعلى" : "Better glucose, fitter body" },
    { when: lang === "ar" ? "الشهر ٦" : "Month 6", what: lang === "ar" ? "ضغط أقل، ثقة أكبر" : "Lower BP, stronger confidence" },
    { when: lang === "ar" ? "سنة" : "Year 1", what: lang === "ar" ? "أسلوب حياة جديد ثابت" : "A new sustainable lifestyle" },
  ];

  return (
    <AppShell>
      <div className="mb-6 animate-fade-up">
        <div className="text-[11px] uppercase tracking-widest text-primary/70 font-semibold">{t.insights}</div>
        <h1 className="font-display text-4xl text-foreground mt-1 leading-none">
          {lang === "ar" ? "تقدمك" : "Your progress"}
        </h1>
      </div>

      <section className={`relative overflow-hidden rounded-3xl p-5 shadow-glow ${trendMeta.cls} animate-fade-up`}>
        <div className="absolute -bottom-10 -end-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">{trendMeta.icon}</div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-widest opacity-80 font-semibold">{t.wellnessTrend}</div>
            <div className="font-display text-2xl leading-tight">{trendMeta.label}</div>
            <div className="text-xs opacity-80 mt-0.5">
              {trend.days > 0
                ? lang === "ar"
                  ? `متوسط ${trend.avg} على ${trend.days} أيام`
                  : `Avg ${trend.avg} over ${trend.days} days`
                : lang === "ar"
                  ? "سجّلي أياماً أكثر لنرى الاتجاه"
                  : "Log more days to see the trend"}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 animate-fade-up">
        <ScoreCard icon={<Sparkles className="w-4 h-4" />} label={t.lifestyleScore} value={life} accent="primary" />
        <ScoreCard icon={<Heart className="w-4 h-4" />} label={t.heartScore} value={heart} accent="rose" />
        <ScoreCard icon={<ShieldCheck className="w-4 h-4" />} label={t.diabetesScore} value={dpp} accent="teal" full />
      </section>

      <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mt-8 mb-3 px-1">
        {lang === "ar" ? "خط رحلتك" : "Your journey"}
      </div>
      <div className="relative ps-4">
        <div className="absolute top-1 bottom-1 start-1.5 w-px bg-border" />
        <div className="space-y-3">
          {timeline.map((s, i) => (
            <div key={s.when} className="relative animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="absolute -start-[13px] top-3 w-3 h-3 rounded-full bg-gradient-primary shadow-soft" />
              <div className="p-3 rounded-2xl bg-card border border-border shadow-soft ms-3">
                <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">{s.when}</div>
                <div className="text-sm mt-0.5">{s.what}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 mb-4 p-4 rounded-2xl bg-secondary/50 text-xs text-muted-foreground text-center">
        {lang === "ar"
          ? `أيام مسجّلة: ${Object.keys(logs).length} · أيام متتالية: ${streak}`
          : `Logged days: ${Object.keys(logs).length} · Streak: ${streak}`}
      </div>
    </AppShell>
  );
}

function ScoreCard({ icon, label, value, accent, full }: { icon: React.ReactNode; label: string; value: number; accent: "primary" | "rose" | "teal"; full?: boolean }) {
  const bar = accent === "primary" ? "bg-gradient-primary" : accent === "rose" ? "bg-gradient-gold" : "bg-gradient-teal";
  return (
    <div className={`p-4 rounded-3xl bg-card border border-border shadow-soft ${full ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
        {icon}
        {label}
      </div>
      <div className="font-display text-4xl text-foreground num mt-2 leading-none">{value}</div>
      <div className="mt-3 h-1.5 bg-secondary/60 rounded-full overflow-hidden">
        <div className={`h-full ${bar} transition-all duration-700`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}