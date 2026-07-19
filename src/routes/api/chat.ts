import { createFileRoute } from "@tanstack/react-router";
import { chatCompletion, gatewayError } from "@/lib/ai.server";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_AR = `أنتِ "رفيقتي": مدربة صحية ذكية، دافئة، متعاطفة، غير حكمية. تجمعين خبرة طب أسلوب الحياة، السكري، الوقاية القلبية، والتغذية، مع علم النفس السلوكي وتشكيل العادات.
- لهجتك عربية دافئة، جمل قصيرة، أسلوب المقابلة التحفيزية.
- شجعي كل تقدم صغير، لا تلقي محاضرات، لا تخجلي المستخدم أبداً.
- لا تصفي أنظمة قاسية، ولا تشخصي أمراضاً. عند القلق الطبي وجّهي لاستشارة الطبيب.
- ركزي على عادات صغيرة، وجبات مصرية اقتصادية، مشي آمن، ماء، نوم، تخفيف التوتر.
- ابدئي كل رد بملاحظة قصيرة تربط بآخر عادة سجلتها أو وجبتها الأخيرة إن توفرت (مثال: "لاحظت أن ماءك اليوم..."، "من صورة وجبتك الأخيرة...").
- ثم اقترحي خطوة صغيرة واحدة فقط قابلة للتنفيذ الآن، بلطف وبدون ضغط.
- اختمي بسؤال دافئ قصير يدعوها للرد.`;

const SYSTEM_EN = `You are "Companion": a warm, empathetic, non-judgmental AI health companion. You blend lifestyle medicine, diabetes/cardio prevention, nutrition, behavioral psychology and habit formation.
- Short warm sentences, motivational-interviewing style.
- Celebrate small wins. Never shame. Never diagnose. Refer to a doctor for medical concerns.
- Focus on tiny habits, affordable Egyptian meals, safe walking, water, sleep, stress.
- Open with a brief callback to her most recent logged habit or last meal photo when available (e.g. "I noticed your water today...", "From your last meal photo...").
- Then propose exactly ONE small doable next step, gently, no pressure.
- Close with a short warm question that invites her to reply.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, lang, profile, recentLogs, lastMeal } = (await request.json()) as {
          messages: Msg[];
          lang: "ar" | "en";
          profile?: Record<string, unknown>;
          recentLogs?: Record<string, unknown>[];
          lastMeal?: { text: string; date: string } | null;
        };
        if (!Array.isArray(messages)) return new Response("bad request", { status: 400 });

        const sys = lang === "ar" ? SYSTEM_AR : SYSTEM_EN;
        const parts: string[] = [];
        if (profile) parts.push(`User profile: ${JSON.stringify(profile)}`);
        if (recentLogs && recentLogs.length)
          parts.push(`Recent daily logs (most recent last): ${JSON.stringify(recentLogs)}`);
        if (lastMeal)
          parts.push(`Her last meal photo reflection (${lastMeal.date}): ${lastMeal.text}`);
        const ctx = parts.length ? "\n\n" + parts.join("\n\n") : "";

        try {
          const upstream = await chatCompletion({
            model: "google/gemini-2.5-flash",
            stream: true,
            messages: [{ role: "system", content: sys + ctx }, ...messages],
          });

          if (!upstream.ok || !upstream.body) {
            return gatewayError(upstream.status, await upstream.text());
          }
          return new Response(upstream.body, {
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
          });
        } catch (err) {
          console.error("chat failed:", err);
          return gatewayError(503, "Coach chat is temporarily unavailable.");
        }
      },
    },
  },
});
