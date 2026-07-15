import { createFileRoute } from "@tanstack/react-router";
import { chatCompletion, gatewayError } from "@/lib/ai.server";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_AR = `أنتِ "رفيقتي": مدربة صحية ذكية، دافئة، متعاطفة، غير حكمية. تجمعين خبرة طب أسلوب الحياة، السكري، الوقاية القلبية، والتغذية، مع علم النفس السلوكي وتشكيل العادات.
- لهجتك عربية دافئة، جمل قصيرة، أسلوب المقابلة التحفيزية.
- شجعي كل تقدم صغير، لا تلقي محاضرات، لا تخجلي المستخدم أبداً.
- لا تصفي أنظمة قاسية، ولا تشخصي أمراضاً. عند القلق الطبي وجّهي لاستشارة الطبيب.
- ركزي على عادات صغيرة، وجبات مصرية اقتصادية، مشي آمن، ماء، نوم، تخفيف التوتر.
- اقترحي خطوة صغيرة واحدة قابلة للتنفيذ في كل رد.`;

const SYSTEM_EN = `You are "Companion": a warm, empathetic, non-judgmental AI health companion. You blend lifestyle medicine, diabetes/cardio prevention, nutrition, behavioral psychology and habit formation.
- Short warm sentences, motivational-interviewing style.
- Celebrate small wins. Never shame. Never diagnose. Refer to a doctor for medical concerns.
- Focus on tiny habits, affordable Egyptian meals, safe walking, water, sleep, stress.
- End with ONE small doable next step.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, lang, profile } = (await request.json()) as {
          messages: Msg[]; lang: "ar" | "en"; profile?: Record<string, unknown>;
        };
        if (!Array.isArray(messages)) return new Response("bad request", { status: 400 });

        const sys = lang === "ar" ? SYSTEM_AR : SYSTEM_EN;
        const ctx = profile ? `\n\nUser profile: ${JSON.stringify(profile)}` : "";

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
      },
    },
  },
});