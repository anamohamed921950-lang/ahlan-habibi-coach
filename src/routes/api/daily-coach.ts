import { createFileRoute } from "@tanstack/react-router";
import { chatCompletion, gatewayError } from "@/lib/ai.server";

export const Route = createFileRoute("/api/daily-coach")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { lang, profile, phase } = (await request.json()) as {
          lang: "ar" | "en"; profile?: Record<string, unknown>; phase: "morning" | "evening";
        };
        const isAr = lang === "ar";
        const sys = isAr
          ? "أنتِ مدربة صحية دافئة تكتبين خطة يومية مختصرة. أجيبي بـ JSON فقط بدون أي شرح."
          : "You are a warm health companion writing a short daily plan. Reply with JSON only, no prose.";
        const userMsg = phase === "morning"
          ? (isAr
            ? `اكتبي خطة صباحية للسيدة بالمعطيات: ${JSON.stringify(profile ?? {})}. الحقول المطلوبة (بالعربية، قصيرة ومشجعة):\n{"mission":"...","quote":"...","tinyHabit":"...","walkMinutes":15,"waterCups":8,"affirmation":"..."}`
            : `Write a morning plan for: ${JSON.stringify(profile ?? {})}. Required JSON (short, warm):\n{"mission":"...","quote":"...","tinyHabit":"...","walkMinutes":15,"waterCups":8,"affirmation":"..."}`)
          : (isAr
            ? `اكتبي تأمل مسائي بـ JSON: {"mission":"استعداد للنوم","quote":"...","tinyHabit":"...","walkMinutes":0,"waterCups":0,"affirmation":"..."}`
            : `Evening reflection JSON: {"mission":"wind down","quote":"...","tinyHabit":"...","walkMinutes":0,"waterCups":0,"affirmation":"..."}`);

        const upstream = await chatCompletion({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: sys },
            { role: "user", content: userMsg },
          ],
          response_format: { type: "json_object" },
        });

        if (!upstream.ok) return gatewayError(upstream.status, await upstream.text());
        const data = (await upstream.json()) as { choices?: { message?: { content?: string } }[] };
        const raw = data.choices?.[0]?.message?.content ?? "{}";
        return new Response(raw, { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});