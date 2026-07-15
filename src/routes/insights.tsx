import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { RingScore } from "@/components/RingScore";
import { diabetesPreventionScore, healthAge, heartScore, lifestyleScore } from "@/lib/health";

export const Route = createFileRoute("/insights")({ component: InsightsPage });

function InsightsPage() {
  const { t, lang } = useT();
  const today = useApp((s) => s.getToday());
  const profile = useApp((s) => s.profile);
  const logs = useApp((s) => s.logs);

  const life = lifestyleScore(today);
  const heart = heartScore(today, profile);
  const dpp = diabetesPreventionScore(today, profile);
  const hAge = healthAge(profile, life);

  const timeline = [
    { when: lang === "ar" ? "أسبوع ٢" : "Week 2", what: lang === "ar" ? "طاقة أفضل، مزاج أهدأ" : "More energy, calmer mood" },
    { when: lang === "ar" ? "شهر ١" : "Month 1", what: lang === "ar" ? "خصر أرق، نوم أعمق" : "Trimmer waist, deeper sleep" },
    { when: lang === "ar" ? "شهر ٣" : "Month 3", what: lang === "ar" ? "سكر أفضل، لياقة أعلى" : "Better glucose, fitter body" },
    { when: lang === "ar" ? "شهر ٦" : "Month 6", what: lang === "ar" ? "ضغط أقل، ثقة أكبر" : "Lower BP, stronger confidence" },
    { when: lang === "ar" ? "سنة" : "Year 1", what: lang === "ar" ? "أسلوب حياة جديد ثابت" : "A new sustainable lifestyle" },
  ];

  return (
    <AppShell>
      <h1 className="font-display text-2xl mb-4">{t.insights}</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-card shadow-soft flex flex-col items-center">
          <RingScore value={life} label={t.lifestyleScore} />
        </div>
        <div className="p-4 rounded-3xl bg-card shadow-soft flex flex-col items-center justify-center">
          <div className="text-xs text-muted-foreground">{t.healthAge}</div>
          <div className="font-display text-5xl text-primary num mt-1">{hAge || "—"}</div>
          <div className="text-[10px] text-muted-foreground mt-1 text-center">
            {lang === "ar" ? "أنت تصبحين أصغر سناً" : "Becoming biologically younger"}
          </div>
        </div>
        <div className="p-4 rounded-3xl bg-gradient-hero shadow-soft">
          <div className="text-xs opacity-80">{t.heartScore}</div>
          <div className="font-display text-3xl text-primary num mt-1">{heart}</div>
          <ProgressBar v={heart} />
        </div>
        <div className="p-4 rounded-3xl bg-secondary shadow-soft">
          <div className="text-xs opacity-80">{t.diabetesScore}</div>
          <div className="font-display text-3xl text-primary num mt-1">{dpp}</div>
          <ProgressBar v={dpp} />
        </div>
      </div>

      <h2 className="font-display text-lg mt-8 mb-3">
        {lang === "ar" ? "خط رحلتك" : "Your health timeline"}
      </h2>
      <div className="space-y-3">
        {timeline.map((s) => (
          <div key={s.when} className="flex gap-3 items-start">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
            <div className="flex-1 p-3 rounded-2xl bg-card shadow-soft">
              <div className="text-xs text-primary font-semibold">{s.when}</div>
              <div className="text-sm mt-0.5">{s.what}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-muted text-xs text-muted-foreground text-center">
        {lang === "ar" ? `أيام مسجّلة: ${Object.keys(logs).length}` : `Logged days: ${Object.keys(logs).length}`}
      </div>
    </AppShell>
  );
}

function ProgressBar({ v }: { v: number }) {
  return (
    <div className="mt-2 h-1.5 bg-background/40 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${Math.min(v, 100)}%`, transition: "width 800ms ease" }} />
    </div>
  );
}