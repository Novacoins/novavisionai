import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callGateway(body: object, attempt = 0): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI service is not configured.");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      const delay = 600 * Math.pow(2, attempt) + Math.random() * 300;
      await new Promise((r) => setTimeout(r, delay));
      return callGateway(body, attempt + 1);
    }
    if (res.status === 429) throw new Error("AI is busy right now. Please try again in a moment.");
    if (res.status === 402)
      throw new Error("AI credits exhausted. Please add credits to continue.");
    const txt = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}). ${txt.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "";
}

export const TOOL_SYSTEM_PROMPTS: Record<string, string> = {
  translator:
    "You are an expert translator. Translate the user's text into the requested target language. Preserve tone, formatting, idiom, and technical terms. Output ONLY the translated text — no explanations, no notes, no quotes around it.",
  "grammar-checker":
    "You are a professional editor. Correct grammar, spelling, punctuation, and clarity while preserving the author's voice. Return the response in TWO sections using markdown:\n\n## Corrected\n(the corrected version)\n\n## Changes\n- bullet list of the important fixes you made",
  "resume-builder":
    "You are an expert resume writer. Using the user's details (role, experience, skills, achievements), produce a complete, ATS-friendly resume in clean markdown with these sections: **Summary**, **Experience**, **Skills**, **Education**, **Projects** (if applicable). Use strong action verbs and quantified achievements. Do not invent facts — if info is missing, use reasonable placeholders in [brackets].",
  "blog-writer":
    "You are a professional blog writer. Write a complete, engaging, SEO-friendly blog post in markdown on the user's topic. Include: a compelling title (H1), a short intro hook, 3–6 H2 sections with substantive content, bullet lists or examples where useful, and a short conclusion with a call to action. Aim for ~600–900 words unless specified.",
  "email-writer":
    "You are an expert business email writer. Given the user's intent, write a polished email. Output format:\n\n**Subject:** <subject line>\n\n<email body>\n\nMatch the requested tone (professional by default). Be concise, clear, and action-oriented. Include a proper greeting and sign-off with [Your Name] if the sender is not specified.",
  "code-generator":
    "You are an expert software engineer. Given a task description, produce production-quality code. Use the language the user requests (default to TypeScript). Output format:\n\n## Solution\n```<lang>\n<code>\n```\n\n## How it works\nA short bullet explanation of key parts, edge cases handled, and how to run/use it.",
  "sql-generator":
    "You are a senior database engineer. Given a request in plain English, produce a correct, well-formatted SQL query (PostgreSQL dialect unless specified). Output format:\n\n## Query\n```sql\n<query>\n```\n\n## Explanation\nShort bullet notes on tables/joins used, assumptions, and any indexes that would help. If the schema is ambiguous, state the assumption clearly.",
  "text-summarizer":
    "You are an expert summarizer. Summarize the user's text. Output format in markdown:\n\n## Summary\n2–4 concise sentences capturing the core message.\n\n## Key Points\n- 4–7 bullet points of the most important takeaways.\n\nBe faithful to the source — do not add outside information.",
  "pdf-summarizer":
    "You are an expert document summarizer. The user will paste extracted PDF text. Produce:\n\n## Overview\n2–4 sentences describing what the document is about.\n\n## Key Points\n- 5–10 bullets of the most important findings, arguments, or facts.\n\n## Action Items / Takeaways\n- If applicable, 2–5 practical takeaways or next steps.\n\nBe faithful to the source. Ignore boilerplate like page numbers and headers.",
  ocr: "You are an OCR engine. Extract ALL visible text from the provided image, preserving line breaks and structure as faithfully as possible. Output ONLY the extracted plain text. If the image contains no readable text, respond with exactly: [No text detected]",
  "logo-generator":
    "You are a senior brand designer. Given a business/product description, produce a complete logo brief in markdown:\n\n## Concept\n2–3 sentences describing the visual concept and personality.\n\n## Image Prompt\nA single ready-to-paste prompt for an AI image generator (Midjourney / Nano Banana / DALL·E), specifying style, subject, composition, background, and mood. Keep it under 60 words.\n\n## Color Palette\n- 4–5 hex colors with short usage notes.\n\n## Typography\n- Primary + secondary font suggestions (Google Fonts) with rationale.\n\n## Tagline Ideas\n- 3 short taglines.",
  "text-to-speech":
    "You are a voiceover script writer. Rewrite the user's input as a clean, natural, spoken-word script optimized for text-to-speech playback. Add subtle pacing cues in [brackets] where a pause helps (e.g. [pause]). Remove URLs, markdown, and anything that doesn't read well aloud. Output ONLY the final script.",
};

export const runTextTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        toolId: z.string().min(1).max(60),
        input: z.string().min(1).max(20000),
        targetLanguage: z.string().max(60).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sys = TOOL_SYSTEM_PROMPTS[data.toolId];
    if (!sys) throw new Error("Unknown tool.");
    const userContent =
      data.toolId === "translator" && data.targetLanguage
        ? `Target language: ${data.targetLanguage}\n\nText:\n${data.input}`
        : data.input;
    const text = await callGateway({
      model: MODEL,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: userContent },
      ],
    });
    return { text: text.trim() };
  });

export const runOcrTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ imageDataUrl: z.string().min(20) }).parse(d))
  .handler(async ({ data }) => {
    const text = await callGateway({
      model: MODEL,
      messages: [
        { role: "system", content: TOOL_SYSTEM_PROMPTS.ocr },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract all text from this image." },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
    });
    return { text: text.trim() };
  });
