import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Droplet, Footprints, Moon, Beef, Salad, Apple, Dumbbell, Brain, Minus, Plus, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/habits")({ component: HabitsPage });

function HabitsPage() {
  const { t } = useT();
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
    if (val) { addXp(6); bumpStreak(); toast.success("🌸 +6 XP"); }
  };

  return (
    <AppShell>
      <h1 className="font-display text-2xl mb-4">{t.logHabit}</h1>

      <section className="space-y-3">
        <Counter icon={<Droplet />} label={t.water} unit="/8" value={today.waterCups} onInc={() => inc("waterCups", 1)} onDec={() => inc("waterCups", -1)} />
        <Counter icon={<Footprints />} label={t.steps} unit="/7000" value={today.steps} onInc={() => inc("steps", 500)} onDec={() => inc("steps", -500)} />
        <Counter icon={<Moon />} label={t.sleep} unit="h" value={today.sleepHours} onInc={() => inc("sleepHours", 1)} onDec={() => inc("sleepHours", -1)} />
      </section>

      <h2 className="font-display text-lg mt-8 mb-3">✨</h2>
      <div className="grid grid-cols-2 gap-3">
        <Toggle icon={<Beef />} label={t.protein} on={today.proteins} onClick={() => toggle("proteins")} />
        <Toggle icon={<Salad />} label={t.veggies} on={today.veggies} onClick={() => toggle("veggies")} />
        <Toggle icon={<Apple />} label={t.fruit} on={today.fruit} onClick={() => toggle("fruit")} />
        <Toggle icon={<Dumbbell />} label={t.exercise} on={today.exercise} onClick={() => toggle("exercise")} />
        <Toggle icon={<Brain />} label={t.meditation} on={today.meditation} onClick={() => toggle("meditation")} />
      </div>
    </AppShell>
  );
}

function Counter({ icon, label, value, unit, onInc, onDec }: { icon: React.ReactNode; label: string; value: number; unit: string; onInc: () => void; onDec: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-card shadow-soft">
      <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="font-display text-2xl text-primary num">{value}<span className="text-sm text-muted-foreground ms-1">{unit}</span></div>
      </div>
      <button onClick={onDec} className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center active:scale-95"><Minus className="w-4 h-4" /></button>
      <button onClick={onInc} className="w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center active:scale-95 shadow-soft"><Plus className="w-4 h-4" /></button>
    </div>
  );
}

function Toggle({ icon, label, on, onClick }: { icon: React.ReactNode; label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`p-4 rounded-2xl flex flex-col items-start gap-2 transition-all active:scale-[0.98] ${
        on ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-card shadow-soft"
      }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${on ? "bg-white/20" : "bg-secondary text-primary"}`}>{on ? <Check /> : icon}</div>
      <div className="text-sm font-medium">{label}</div>
    </button>
  );
}