import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Droplet, Footprints, Moon, Beef, Salad, Apple, Dumbbell, Brain, Minus, Plus, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/habits")({ component: HabitsPage });

function HabitsPage() {
  const { t, lang } = useT();
  const today = useApp((s) => s.getToday());
  const updateToday = useApp((s) => s.updateToday);
  const addXp = useApp((s) => s.addXp);
  const bumpStreak = useApp((s) => s.bumpStreak);

  const inc = (k: "waterCups" | "steps" | "sleepHours", d: number) => {
    const cur = today[k] as number;
    const next = Math.max(0, cur + d);
    updateToday({ [k]: next } as Partial<typeof today>);
    if (d > 0) { addXp(2); bumpStreak(); }
  };

  const toggle = (k: "proteins" | "veggies" | "fruit" | "exercise" | "meditation") => {
    const val = !today[k];
    updateToday({ [k]: val } as Partial<typeof today>);
    if (val) { addXp(6); bumpStreak(); toast.success("+6 XP ✨"); }
  };

  return (
    <AppShell>
      <div className="mb-6 animate-fade-up">
        <div className="text-[11px] uppercase tracking-widest text-primary/70 font-semibold">
          {t.quickLog}
        </div>
        <h1 className="font-display text-4xl text-foreground mt-1 leading-none">{t.logHabit}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === "ar" ? "خطوات صغيرة، أثر كبير" : "Small taps, big shifts"}
        </p>
      </div>

      <section className="space-y-3 animate-fade-up">
        <Counter icon={<Droplet />} label={t.water} goal={8} unit="/8" value={today.waterCups} onInc={() => inc("waterCups", 1)} onDec={() => inc("waterCups", -1)} />
        <Counter icon={<Footprints />} label={t.steps} goal={7000} unit="/7000" value={today.steps} onInc={() => inc("steps", 500)} onDec={() => inc("steps", -500)} />
        <Counter icon={<Moon />} label={t.sleep} goal={7} unit="h" value={today.sleepHours} onInc={() => inc("sleepHours", 1)} onDec={() => inc("sleepHours", -1)} />
      </section>

      <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mt-8 mb-3 px-1">
        {lang === "ar" ? "علاماتك اليومية" : "Daily wins"}
      </div>
      <section className="grid grid-cols-2 gap-3 animate-fade-up">
        <Toggle icon={<Beef />} label={t.protein} on={today.proteins} onClick={() => toggle("proteins")} />
        <Toggle icon={<Salad />} label={t.veggies} on={today.veggies} onClick={() => toggle("veggies")} />
        <Toggle icon={<Apple />} label={t.fruit} on={today.fruit} onClick={() => toggle("fruit")} />
        <Toggle icon={<Dumbbell />} label={t.exercise} on={today.exercise} onClick={() => toggle("exercise")} />
        <Toggle icon={<Brain />} label={t.meditation} on={today.meditation} onClick={() => toggle("meditation")} />
      </section>
    </AppShell>
  );
}

function Counter({ icon, label, value, unit, onInc, onDec, goal }: { icon: React.ReactNode; label: string; value: number; unit: string; onInc: () => void; onDec: () => void; goal: number }) {
  const pct = Math.min(100, (value / goal) * 100);
  return (
    <div className="p-4 rounded-3xl bg-card border border-border shadow-soft">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-soft">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
          <div className="font-display text-3xl text-foreground num leading-none mt-0.5">
            {value}
            <span className="text-sm text-muted-foreground ms-1">{unit}</span>
          </div>
        </div>
        <button onClick={onDec} className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center active:scale-95 transition-transform">
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={onInc} className="w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center active:scale-95 shadow-soft transition-transform">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 h-1.5 bg-secondary/60 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Toggle({ icon, label, on, onClick }: { icon: React.ReactNode; label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-3xl flex flex-col items-start gap-3 min-h-[110px] transition-all active:scale-[0.98] border ${on ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-card border-border shadow-soft hover:border-primary/40"}`}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${on ? "bg-white/20" : "bg-secondary text-primary"}`}>
        {on ? <Check className="w-5 h-5" /> : icon}
      </div>
      <div className="text-sm font-medium">{label}</div>
    </button>
  );
}