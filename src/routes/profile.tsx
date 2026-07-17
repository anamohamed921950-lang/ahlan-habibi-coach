import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { AppShell } from "@/components/AppShell";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: EditProfile });

function EditProfile() {
  const { t, lang } = useT();
  const nav = useNavigate();
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);

  useEffect(() => {
    if (!profile) nav({ to: "/onboarding" });
  }, [profile, nav]);

  const [f, setF] = useState(
    () =>
      profile ?? {
        name: "", age: 40, heightCm: 165, weightKg: 85, waistCm: 95,
        goal: t.onboarding.goals[0], activity: 1, foods: "", motivation: 7,
        createdAt: new Date().toISOString(),
      },
  );

  if (!profile) return null;

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6 animate-fade-up">
        <button onClick={() => nav({ to: "/" })}
          className="w-10 h-10 rounded-full bg-card border border-border shadow-soft flex items-center justify-center"
          aria-label={t.back}>
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-primary/70 font-semibold">
            {lang === "ar" ? "بياناتك" : "Your details"}
          </div>
          <h1 className="font-display text-3xl text-foreground leading-none mt-1">
            {f.name || (lang === "ar" ? "جميلة" : "you")}
          </h1>
        </div>
      </div>

      <div className="space-y-4 pb-40">
        <Field label={t.onboarding.name}>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={t.onboarding.namePh} className="lc-input" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.onboarding.age}><NumInput v={f.age} on={(v) => setF({ ...f, age: v })} /></Field>
          <Field label={t.onboarding.height}><NumInput v={f.heightCm} on={(v) => setF({ ...f, heightCm: v })} /></Field>
          <Field label={t.onboarding.weight}><NumInput v={f.weightKg} on={(v) => setF({ ...f, weightKg: v })} /></Field>
          <Field label={t.onboarding.waist}><NumInput v={f.waistCm} on={(v) => setF({ ...f, waistCm: v })} /></Field>
        </div>

        <Field label={t.onboarding.goal}>
          <div className="grid grid-cols-1 gap-2">
            {t.onboarding.goals.map((g) => (
              <button key={g} type="button" onClick={() => setF({ ...f, goal: g })}
                className={`p-3 rounded-2xl text-start transition-all border ${f.goal === g ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-card border-border"}`}>
                {g}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t.onboarding.activity}>
          <div className="grid grid-cols-2 gap-2">
            {t.onboarding.activities.map((a, i) => (
              <button key={a} type="button" onClick={() => setF({ ...f, activity: i })}
                className={`p-3 rounded-2xl transition-all border ${f.activity === i ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-card border-border"}`}>
                {a}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t.onboarding.food}>
          <input value={f.foods} onChange={(e) => setF({ ...f, foods: e.target.value })} placeholder={t.onboarding.foodPh} className="lc-input" />
        </Field>

        <Field label={`${t.onboarding.motivation}: ${f.motivation}`}>
          <input type="range" min={1} max={10} value={f.motivation}
            onChange={(e) => setF({ ...f, motivation: Number(e.target.value) })}
            className="w-full accent-[oklch(0.56_0.16_40)]" />
        </Field>
      </div>

      <div className="fixed bottom-20 inset-x-0 p-5 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="mx-auto max-w-md flex gap-3">
          <button onClick={() => nav({ to: "/" })}
            className="flex-1 py-4 rounded-2xl bg-card border border-border text-foreground font-medium">
            {t.cancel}
          </button>
          <button
            onClick={() => { setProfile({ ...f, createdAt: profile.createdAt }); nav({ to: "/" }); }}
            className="flex-[2] py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow active:scale-[0.98] transition-transform">
            {t.save}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-1">{label}</label>
      {children}
    </div>
  );
}
function NumInput({ v, on }: { v: number; on: (n: number) => void }) {
  return <input type="number" value={v} onChange={(e) => on(Number(e.target.value) || 0)} className="lc-input" inputMode="numeric" />;
}