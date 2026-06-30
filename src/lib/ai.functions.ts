import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

function systemForScanType(scanType: "general" | "food" | "plant") {
  const base = `You are Nova Vision AI, a friendly expert visual assistant. Analyze the image and respond ONLY with valid JSON matching this exact shape:
{
  "title": "short name of the main subject (max 6 words)",
  "category": "one of: food | plant | product | ingredient | object | animal | document | unknown",
  "confidence": number between 0 and 1,
  "safety": "one of: safe | caution | unsafe | unknown",
  "summary": "1-2 sentence plain-language overview",
  "details": ["3-6 bullet points of useful, structured info"],
  "recommendations": ["2-4 practical next-step suggestions"],
  "warnings": ["any safety warnings, or [] if none"]
}
Be accurate, educational, beginner-friendly. Never give medical diagnoses. Always include safety caveats when relevant. Use simple language.`;
  if (scanType === "food")
    return base + `
For food, include in "details" an estimated calorie range, key nutrients, health benefits, who should avoid it, best time to eat. If multiple items visible, list each. If freshness is visually judgeable, note it.`;
  if (scanType === "plant")
    return base + `
For plants, include in "details": common name, scientific name, edibility, toxicity level, traditional uses, basic care (water/sunlight), natural habitat. If toxic, include strong "Do not consume" warning in "warnings".`;
  return base;
}

async function callGateway(body: object, attempt = 0): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI service is not configured.");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // Retry transient failures (rate limit / upstream) with exponential backoff
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      const delay = 600 * Math.pow(2, attempt) + Math.random() * 300;
      await new Promise((r) => setTimeout(r, delay));
      return callGateway(body, attempt + 1);
    }
    if (res.status === 429) throw new Error("AI is busy right now. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Lovable Cloud → Workspace billing.");
    const txt = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}). ${txt.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "";
}

export const analyzeImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        imageDataUrl: z.string().min(20),
        scanType: z.enum(["general", "food", "plant"]).default("general"),
        note: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const text = await callGateway({
      model: MODEL,
      messages: [
        { role: "system", content: systemForScanType(data.scanType) },
        {
          role: "user",
          content: [
            { type: "text", text: data.note || "Analyze this image thoroughly." },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });
    try {
      const parsed = JSON.parse(text);
      return parsed as {
        title: string;
        category: string;
        confidence: number;
        safety: string;
        summary: string;
        details: string[];
        recommendations: string[];
        warnings: string[];
      };
    } catch {
      return {
        title: "Analysis",
        category: "unknown",
        confidence: 0.5,
        safety: "unknown",
        summary: text.slice(0, 400),
        details: [],
        recommendations: [],
        warnings: [],
      };
    }
  });

export const chatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant", "system"]),
              content: z.string(),
              imageUrl: z.string().optional(),
            }),
          )
          .min(1)
          .max(40),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sys = {
      role: "system" as const,
      content:
        "You are Nova Vision AI, a friendly, knowledgeable assistant for food, plants, health, and everyday objects. Format with markdown headings, bullet points, and short paragraphs. Never give medical diagnoses; include safety caveats when relevant. Be concise and practical.",
    };
    const msgs = data.messages.map((m) =>
      m.imageUrl
        ? {
            role: m.role,
            content: [
              { type: "text", text: m.content || "Please analyze this image." },
              { type: "image_url", image_url: { url: m.imageUrl } },
            ],
          }
        : { role: m.role, content: m.content },
    );
    const text = await callGateway({ model: MODEL, messages: [sys, ...msgs] });
    return { text };
  });

export const generateMealPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        goal: z.string().default("stay healthy"),
        diet: z.string().default("balanced"),
        availableIngredients: z.array(z.string()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const prompt = `Create a one-day meal plan for someone whose goal is "${data.goal}" and diet preference is "${data.diet}".${
      data.availableIngredients?.length
        ? " They have these ingredients on hand: " + data.availableIngredients.join(", ") + "."
        : ""
    }
Respond ONLY with valid JSON:
{
  "meals": [
    {
      "meal_type": "breakfast" | "lunch" | "dinner" | "snack",
      "name": "string",
      "description": "1-2 sentence summary",
      "ingredients": ["..."],
      "steps": ["short numbered prep steps"],
      "calories": number,
      "nutrition": { "protein_g": number, "carbs_g": number, "fat_g": number, "highlights": "string" }
    }
  ],
  "tip": "one short nutrition tip for the day"
}`;
    const text = await callGateway({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a friendly AI nutritionist. Be practical, never give medical advice." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });
    try {
      return JSON.parse(text) as {
        meals: Array<{
          meal_type: string;
          name: string;
          description: string;
          ingredients: string[];
          steps: string[];
          calories: number;
          nutrition: { protein_g: number; carbs_g: number; fat_g: number; highlights: string };
        }>;
        tip: string;
      };
    } catch {
      return { meals: [], tip: text.slice(0, 200) };
    }
  });

export const dailyTip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const d = (data ?? {}) as { topic?: unknown };
    return { topic: typeof d.topic === "string" ? d.topic : undefined };
  })
  .handler(async ({ data }) => {
    const userPrompt = data.topic ?? "Tip of the day, please.";
    const sys = data.topic
      ? "You give short (max 220 chars) helpful insights. Plain text, no markdown, vary the content each call."
      : "Give ONE concise (max 220 chars) practical nutrition or wellness tip. Plain text, no markdown.";
    const text = await callGateway({
      model: MODEL,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: userPrompt },
      ],
    });
    return { tip: text.trim() };
  });
