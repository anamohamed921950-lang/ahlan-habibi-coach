import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/coach")({ component: CoachPage });

function CoachPage() {
  const { t, lang } = useT();
  const chat = useApp((s) => s.chat);
  const appendChat = useApp((s) => s.appendChat);
  const updateLastChat = useApp((s) => s.updateLastChat);
  const profile = useApp((s) => s.profile);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }); }, [chat, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    const nextMsgs = [...chat, { role: "user" as const, content: text }];
    appendChat({ role: "user", content: text });
    appendChat({ role: "assistant", content: "" });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMsgs, lang, profile }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]" || !payload) continue;
          try {
            const j = JSON.parse(payload) as { choices?: { delta?: { content?: string } }[] };
            const delta = j.choices?.[0]?.delta?.content;
            if (delta) { acc += delta; updateLastChat(acc); }
          } catch { /* ignore */ }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      toast.error(msg);
      updateLastChat(lang === "ar" ? "عذراً، حدث خطأ. حاولي مجدداً." : "Sorry, something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div ref={scrollRef} className="pb-32 -mx-2 overflow-y-auto max-h-[calc(100vh-190px)]">
        {chat.length === 0 && (
          <div className="p-4 rounded-3xl bg-gradient-hero mb-3 shadow-soft">
            <p className="text-sm text-secondary-foreground leading-relaxed">{t.chatWelcome}</p>
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`px-2 mb-3 ${m.role === "user" ? "flex justify-end" : ""}`}>
            {m.role === "user" ? (
              <div className="max-w-[85%] bg-gradient-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-ee-md shadow-soft whitespace-pre-wrap">
                {m.content}
              </div>
            ) : (
              <div className="max-w-[92%] text-foreground prose prose-sm prose-p:my-1 prose-strong:text-primary">
                {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <TypingDots />}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-16 inset-x-0 p-3 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="mx-auto max-w-md flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder={t.chatPlaceholder}
            className="flex-1 resize-none px-4 py-3 rounded-2xl bg-card border border-border focus:border-primary outline-none text-[15px]"
          />
          <button onClick={send} disabled={busy || !input.trim()}
            className="w-12 h-12 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow disabled:opacity-40 active:scale-95">
            <Send className="w-5 h-5 rtl:-scale-x-100" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-2">
      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "120ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "240ms" }} />
    </div>
  );
}