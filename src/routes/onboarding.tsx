import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useApp, type OnboardingDraft } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Check, Heart, Save } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const DEFAULTS: Required<Omit<OnboardingDraft, "createdAt">> = {
  name: "",
  age: 40,
  heightCm: 165,
  weightKg: 85,
  waistCm: 95,
  goal: "",
  activity: 1,
  foods: "",
  motivation: 7,
};

function Onboarding() {
  const { t, lang } = useT();
  const nav = useNavigate();
  const draft = useApp((s) => s.onboardingDraft);
  const step = useApp((s) => s.onboardingStep);
  const updateOnboarding = useApp((s) => s.updateOnboarding);
  const setOnboardingStep = useApp((s) => s.setOnboardingStep);
  const clearOnboarding = useApp((s) => s.clearOnboarding);
  const setProfile = useApp((s) => s.setProfile);

  const f = useMemo(
    () => ({
      ...DEFAULTS,
      goal: DEFAULTS.goal || t.onboarding.goals[0],
      ...draft,
    }),
    [draft, t.onboarding.goals],
  );

  const patch = (p: OnboardingDraft) => updateOnboarding(p);

  const steps = [
    { key: "welcome", title: t.onboarding.welcome, body: <Welcome sub={t.onboarding.welcomeSub} savedNote={t.onboarding.progressSaved} /> },
    {
      key: "name",
      title: t.onboarding.name,
      body: (
        <input
          value={f.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder={t.onboarding.namePh}
          className="lc-input"
          autoFocus
        />
      ),
    },
    {
      key: "body",
      title: t.onboarding.body,
      sub: t.onboarding.bodySub,
      body: (
        <div className="space-y-3">
          <NumField label={t.onboarding.age} v={f.age} on={(v) => patch({ age: v })} />
          <NumField label={t.onboarding.height} v={f.heightCm} on={(v) => patch({ heightCm: v })} />
          <NumField label={t.onboarding.weight} v={f.weightKg} on={(v) => patch({ weightKg: v })} />
          <NumField label={t.onboarding.waist} v={f.waistCm} on={(v) => patch({ waistCm: v })} />
        </div>
      ),
    },
    {
      key: "goal",
      title: t.onboarding.goal,
      body: (
        <div className="grid grid-cols-1 gap-2">
          {t.onboarding.goals.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => patch({ goal: g })}
              className={`p-4 rounded-2xl text-start transition-all border ${f.goal === g ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-card border-border hover:border-primary/40"}`}
            >
              <span className="font-medium">{g}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "activity",
      title: t.onboarding.activity,
      body: (
        <div className="grid grid-cols-2 gap-2">
          {t.onboarding.activities.map((a, i) => (
            <button
              key={a}
              type="button"
              onClick={() => patch({ activity: i })}
              className={`p-4 rounded-2xl transition-all border ${f.activity === i ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-card border-border hover:border-primary/40"}`}
            >
              {a}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "food",
      title: t.onboarding.food,
      body: (
        <input
          value={f.foods}
          onChange={(e) => patch({ foods: e.target.value })}
          placeholder={t.onboarding.foodPh}
          className="lc-input"
        />
      ),
    },
    {
      key: "motivation",
      title: `${t.onboarding.motivation}`,
      body: (
        <div className="p-4 rounded-3xl bg-card border border-border shadow-soft">
          <div className="text-center font-display text-6xl text-primary num mb-4">{f.motivation}</div>
          <input
            type="range"
            min={1}
            max={10}
            value={f.motivation}
            onChange={(e) => patch({ motivation: Number(e.target.value) })}
            className="w-full accent-[oklch(0.56_0.16_40)]"
          />
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      ),
    },
    { key: "done", title: t.onboarding.done, body: <DoneCard sub={t.onboarding.doneSub} /> },
  ];

  useEffect(() => {
    if (step > steps.length - 1) setOnboardingStep(steps.length - 1);
  }, [step, steps.length, setOnboardingStep]);

  const current = steps[Math.max(0, Math.min(step, steps.length - 1))];
  const last = step === steps.length - 1;

  const finish = () => {
    const merged = { ...DEFAULTS, ...draft };
    setProfile({
      name: (merged.name || "").trim() || (lang === "ar" ? "جميلة" : "friend"),
      age: merged.age,
      heightCm: merged.heightCm,
      weightKg: merged.weightKg,
      waistCm: merged.waistCm,
      goal: merged.goal || t.onboarding.goals[0],
      activity: merged.activity,
      foods: merged.foods,
      motivation: merged.motivation,
      createdAt: new Date().toISOString(),
    });
    clearOnboarding();
    nav({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="mx-auto max-w-md px-6 pt-8 pb-40">
        {/* Top row: back + progress dots + save badge */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setOnboardingStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="w-10 h-10 rounded-full bg-card border border-border shadow-soft flex items-center justify-center text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t.back}
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <div className="flex-1 flex gap-1.5 items-center">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "flex-[2] bg-primary" : i < step ? "flex-1 bg-primary/50" : "flex-1 bg-border"}`}
              />
            ))}
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-card/60 rounded-full px-2.5 py-1 border border-border">
            <Save className="w-3 h-3 text-primary" />
            {t.onboarding.progressSaved}
          </div>
        </div>

        <div key={current.key} className="animate-fade-up">
          <div className="mb-2">
            <span className="text-[11px] uppercase tracking-widest text-primary/80 font-semibold">
              {step + 1} / {steps.length}
            </span>
          </div>
          <h1 className="font-display text-4xl text-foreground text-balance leading-tight">
            {current.title}
          </h1>
          {current.sub ? <p className="mt-2 text-sm text-muted-foreground">{current.sub}</p> : null}
          <div className="mt-8">{current.body}</div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 p-5 pb-6 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="mx-auto max-w-md flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setOnboardingStep(step - 1)}
              className="flex-1 py-4 rounded-2xl bg-card border border-border text-foreground font-medium active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {t.back}
            </button>
          )}
          <button
            onClick={() => {
              if (last) finish();
              else setOnboardingStep(step + 1);
            }}
            className="flex-[2] py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
          >
            {last ? t.finish : t.next}
            {last ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Welcome({ sub, savedNote }: { sub: string; savedNote: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto w-24 h-24 rounded-full bg-gradient-sunset shadow-glow flex items-center justify-center mb-6 animate-float">
        <Heart className="w-10 h-10 text-primary-foreground" fill="currentColor" />
      </div>
      <p className="text-muted-foreground leading-relaxed text-balance">{sub}</p>
      <p className="mt-6 text-xs text-primary/70">{savedNote}</p>
    </div>
  );
}

function DoneCard({ sub }: { sub: string }) {
  return (
    <div className="text-center py-6">
      <div className="mx-auto w-24 h-24 rounded-full bg-gradient-gold shadow-glow flex items-center justify-center mb-6 animate-float">
        <Check className="w-10 h-10 text-accent-foreground" strokeWidth={3} />
      </div>
      <p className="text-muted-foreground leading-relaxed px-4 text-balance">{sub}</p>
    </div>
  );
}

function NumField({ label, v, on }: { label: string; v: number; on: (n: number) => void }) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
      <span className="flex-1 text-sm text-muted-foreground">{label}</span>
      <input
        type="number"
        value={v}
        onChange={(e) => on(Number(e.target.value) || 0)}
        inputMode="numeric"
        className="w-24 text-end px-3 py-2 rounded-xl bg-secondary/60 border-0 font-display text-xl text-primary num focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}