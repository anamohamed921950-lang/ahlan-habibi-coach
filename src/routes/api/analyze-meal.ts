import { createFileRoute } from "@tanstack/react-router";
import { chatCompletion, gatewayError } from "@/lib/ai.server";

export const Route = createFileRoute("/api/analyze-meal")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { image, lang } = (await request.json()) as { image: string; lang: "ar" | "en" };
        if (!image) return new Response("no image", { status: 400 });

        const prompt = lang === "ar"
          ? `حللي هذه الوجبة بلطف. أخبريني:\n1) اسم الطبق وصفاً موجزاً\n2) توازن الطبق (بروتين / خضروات / كربوهيدرات)\n3) نجمة الوجبة (شيء إيجابي واحد)\n4) تحسين لطيف واحد فقط، غير حكمي، بلا سعرات\nأجيبي بأسلوب دافئ ومشجع.`
          : `Gently analyze this meal. Tell me:\n1) Dish name + short description\n2) Plate balance (protein / veg / carbs)\n3) One positive highlight\n4) ONE gentle non-judgmental improvement — no calorie talk\nWarm, encouraging tone.`;

        const upstream = await chatCompletion({
          model: "google/gemini-2.5-flash",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image } },
            ],
          }],
        });

        if (!upstream.ok) return gatewayError(upstream.status, await upstream.text());
        const data = (await upstream.json()) as { choices?: { message?: { content?: string } }[] };
        const text = data.choices?.[0]?.message?.content ?? "";
        return new Response(JSON.stringify({ text }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});