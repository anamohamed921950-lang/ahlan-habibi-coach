import { createFileRoute } from "@tanstack/react-router";
import { chatCompletion, gatewayError } from "@/lib/ai.server";

export const Route = createFileRoute("/weekly-coach")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { lang, profile } = (await request.json()) as {
          lang: "ar" | "en";
          profile?: Record<string, unknown>;
        };
        const isAr = lang === "ar";
        const sys = isAr
          ? "أنتِ مدربة صحية دافئة تكتبين خطة أسبوعية بسيطة ومتنوعة. أجيبي بـ JSON فقط بدون أي شرح."
          : "You are a warm health companion writing a simple, varied 7-day plan. Reply with JSON only, no prose.";
        const userMsg = isAr
          ? `اكتبي خطة أسبوعية (٧ أيام، من السبت إلى الجمعة) للسيدة بالمعطيات: ${JSON.stringify(profile ?? {})}. كل يوم مختلف قليلاً عن الآخر. أجيبي بهذا الشكل فقط:\n{"days":[{"day":"السبت","mission":"...","tinyHabit":"...","walkMinutes":15,"waterCups":8}, ... سبعة أيام بالترتيب]}`
          : `Write a 7-day plan (Mon–Sun) for: ${JSON.stringify(profile ?? {})}. Each day should be slightly different from the others. Reply in exactly this shape:\n{"days":[{"day":"Mon","mission":"...","tinyHabit":"...","walkMinutes":15,"waterCups":8}, ... seven days in order]}`;

        try {
          const upstream = await chatCompletion({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: sys },
              { role: "user", content: userMsg },
            ],
            response_format: { type: "json_object" },
          });

          if (!upstream.ok) return gatewayError(upstream.status, await upstream.text());
          const data = (await upstream.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const raw = data.choices?.[0]?.message?.content ?? "{}";
          return new Response(raw, { headers: { "Content-Type": "application/json" } });
        } catch (err) {
          console.error("weekly-coach failed:", err);
          return gatewayError(503, "Weekly plan is temporarily unavailable.");
        }
      },
    },
  },
});
