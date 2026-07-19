import { createFileRoute } from "@tanstack/react-router";
import { chatCompletion, gatewayError } from "@/lib/ai.server";

export const Route = createFileRoute("/weekly-coach")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { lang, profile, recentLogs, lastMeal } = (await request.json()) as {
          lang: "ar" | "en";
          profile?: Record<string, unknown>;
          recentLogs?: Record<string, unknown>[];
          lastMeal?: { text: string; date: string } | null;
        };
        const isAr = lang === "ar";
        const sys = isAr
          ? "أنتِ مدربة صحية دافئة تكتبين خطة أسبوعية شخصية جداً بناءً على بيانات السيدة الفعلية. لاحظي عاداتها الأضعف وابنِ الخطة حولها بلطف. أجيبي بـ JSON فقط بدون أي شرح."
          : "You are a warm health companion writing a highly personalized 7-day plan based on the user's actual data. Notice her weakest habits and gently build the plan around them. Reply with JSON only, no prose.";
        const ctx = {
          profile: profile ?? {},
          recentLogs: recentLogs ?? [],
          lastMeal: lastMeal ?? null,
        };
        const userMsg = isAr
          ? `بيانات السيدة (استخدميها بجدية لتخصيص كل يوم — عاداتها الأخيرة، مزاجها، خطواتها، ماؤها، وجبتها الأخيرة): ${JSON.stringify(ctx)}.\nاكتبي خطة أسبوعية من ٧ أيام (الاثنين إلى الأحد). كل مهمة تعالج نقطة ضعف حقيقية أو تبني على نقطة قوة من سجلاتها، وتذكر شيئاً من سياقها (مثال: "بعد أن تحسّن ماؤك أمس..."). أجيبي بهذا الشكل فقط:\n{"days":[{"day":"الاثنين","mission":"...","tinyHabit":"...","walkMinutes":15,"waterCups":8}, ... سبعة أيام بالترتيب]}`
          : `User data (use it seriously to personalize each day — her recent habits, mood, steps, water, last meal): ${JSON.stringify(ctx)}.\nWrite a 7-day plan (Mon–Sun). Each mission should address a real weak spot or build on a strength visible in her logs, and can reference her context (e.g. "since your water improved yesterday..."). Reply in exactly this shape:\n{"days":[{"day":"Mon","mission":"...","tinyHabit":"...","walkMinutes":15,"waterCups":8}, ... seven days in order]}`;

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
