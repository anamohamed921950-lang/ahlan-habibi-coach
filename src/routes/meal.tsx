import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { Camera, Sparkles } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export const Route = createFileRoute("/meal")({ component: MealPage });

function MealPage() {
  const { t, lang } = useT();
  const addXp = useApp((s) => s.addXp);
  const setLastMeal = useApp((s) => s.setLastMeal);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(f);
    setResult("");
  };

  const analyze = async () => {
    if (!image) return;
    setBusy(true); setResult("");
    try {
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, lang }),
      });
      if (!res.ok) throw new Error(await res.text());
      const j = (await res.json()) as { text: string };
      setResult(j.text);
      addXp(10);
      setLastMeal({ text: j.text, date: new Date().toISOString() });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setBusy(false); }
  };

  return (
    <AppShell>
      <h1 className="font-display text-2xl mb-1">{t.analyzeMeal}</h1>
      <p className="text-sm text-muted-foreground mb-5">
        {lang === "ar" ? "صورة لطبق طعامك، وسأشاركك ملاحظة لطيفة." : "Snap your plate — I'll share a warm reflection."}
      </p>

      <label className="block relative rounded-3xl overflow-hidden bg-gradient-hero shadow-soft aspect-square cursor-pointer group">
        {image ? (
          <img src={image} alt="meal" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-primary">
            <Camera className="w-12 h-12 mb-2" strokeWidth={1.5} />
            <span className="text-sm font-medium">{t.takePhoto}</span>
          </div>
        )}
        <input type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
      </label>

      {image && (
        <button onClick={analyze} disabled={busy}
          className="mt-4 w-full py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-60">
          <Sparkles className="w-4 h-4" />
          {busy ? t.analyzing : t.analyzeMeal}
        </button>
      )}

      {result && (
        <div className="mt-5 p-5 rounded-3xl bg-card shadow-soft prose prose-sm max-w-none prose-strong:text-primary">
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </AppShell>
  );
}