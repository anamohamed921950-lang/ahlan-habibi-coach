const BASE = "https://ai.gateway.lovable.dev/v1";

export function getKey() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return key;
}

export async function chatCompletion(body: Record<string, unknown>): Promise<Response> {
  return fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export function gatewayError(status: number, msg: string): Response {
  const map: Record<number, string> = {
    429: "Rate limit — please try again shortly.",
    402: "AI credits exhausted. Please add credits in workspace settings.",
  };
  return new Response(map[status] ?? msg, { status });
}