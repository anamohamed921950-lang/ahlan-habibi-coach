import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Heart } from "lucide-react";
import heroImg from "@/assets/hero-wellness.jpg";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { t } = useT();
  const nav = useNavigate();
  const setProfile = useApp((s) => s.setProfile);
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    name: "", age: 40, heightCm: 165, weightKg: 85, waistCm: 95,
    goal: t.onboarding.goals[0], activity: 1, foods: "", motivation: 7,
  });

  const steps: React.ReactNode[] = [
    <div key="w" className="text-center pt-6">
      <div className="relative mx-auto w-64 h-64 mb-6 animate-float">
        <img src={heroImg} alt="" className="w-full h-full object-contain drop-shadow-2xl" />
      </div>
      <h1 className="font-display text-4xl text-primary">{t.onboarding.welcome}</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed px-4">{t.onboarding.welcomeSub}</p>
    </div>,
    <Field key="n" label={t.onboarding.name}>
      <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })}
        placeholder={t.onboarding.namePh} className="input" autoFocus />
    </Field>,
    <div key="b" className="space-y-4">
      <Field label={t.onboarding.age}><NumInput v={f.age} on={(v) => setF({ ...f, age: v })} /></Field>
      <Field label={t.onboarding.height}><NumInput v={f.heightCm} on={(v) => setF({ ...f, heightCm: v })} /></Field>
      <Field label={t.onboarding.weight}><NumInput v={f.weightKg} on={(v) => setF({ ...f, weightKg: v })} /></Field>
      <Field label={t.onboarding.waist}><NumInput v={f.waistCm} on={(v) => setF({ ...f, waistCm: v })} /></Field>
    </div>,
    <Field key="g" label={t.onboarding.goal}>
      <div className="grid grid-cols-1 gap-2">
        {t.onboarding.goals.map((g) => (
          <button key={g} type="button" onClick={() => setF({ ...f, goal: g })}
            className={`p-3 rounded-2xl text-start transition-all ${f.goal === g ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground"}`}>
            {g}
          </button>
        ))}
      </div>
    </Field>,
    <Field key="a" label={t.onboarding.activity}>
      <div className="grid grid-cols-2 gap-2">
        {t.onboarding.activities.map((a, i) => (
          <button key={a} type="button" onClick={() => setF({ ...f, activity: i })}
            className={`p-3 rounded-2xl transition-all ${f.activity === i ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground"}`}>
            {a}
          </button>
        ))}
      </div>
    </Field>,
    <Field key="f" label={t.onboarding.food}>
      <input value={f.foods} onChange={(e) => setF({ ...f, foods: e.target.value })}
        placeholder={t.onboarding.foodPh} className="input" />
    </Field>,
    <Field key="m" label={`${t.onboarding.motivation}: ${f.motivation}`}>
      <input type="range" min={1} max={10} value={f.motivation}
        onChange={(e) => setF({ ...f, motivation: Number(e.target.value) })}
        className="w-full accent-[oklch(0.44_0.11_300)]" />
    </Field>,
    <div key="d" className="text-center py-8">
      <div className="mx-auto w-20 h-20 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center mb-6 animate-float">
        <Heart className="w-9 h-9 text-primary-foreground" fill="currentColor" />
      </div>
      <h2 className="font-display text-3xl text-primary">{t.onboarding.done}</h2>
      <p className="mt-3 text-muted-foreground px-6">{t.onboarding.doneSub}</p>
    </div>,
  ];

  const last = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="mx-auto max-w-md px-6 pt-10 pb-32">
        <div className="flex gap-1.5 justify-center mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-border"}`} />
          ))}
        </div>
        <div className="min-h-[380px]">{steps[step]}</div>
        <div className="fixed bottom-0 inset-x-0 p-5 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="mx-auto max-w-md flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}
                className="flex-1 py-4 rounded-2xl bg-secondary text-secondary-foreground font-medium">
                {t.back}
              </button>
            )}
            <button
              onClick={() => {
                if (last) {
                  setProfile({ ...f, createdAt: new Date().toISOString() });
                  nav({ to: "/" });
                } else setStep(step + 1);
              }}
              className="flex-[2] py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow active:scale-[0.98] transition-transform"
            >
              {last ? t.finish : t.next}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .input { width:100%; padding:14px 16px; border-radius:1rem; background:var(--card); border:1px solid var(--border); font-size:16px; color:var(--foreground); outline:none; }
        .input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 15%, transparent); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-8">
      <label className="block text-lg font-display text-foreground mb-4">{label}</label>
      {children}
    </div>
  );
}
function NumInput({ v, on }: { v: number; on: (n: number) => void }) {
  return <input type="number" value={v} onChange={(e) => on(Number(e.target.value) || 0)} className="input" inputMode="numeric" />;
}