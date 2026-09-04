import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callGateway(body: object): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI service is not configured.");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("AI is busy — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    throw new Error(`AI request failed (${res.status}).`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "";
}

export const generateLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ course: z.string().min(1).max(80), lesson: z.string().min(1).max(160) }).parse(d),
  )
  .handler(async ({ data }) => {
    const sys = `You are a world-class tutor. Produce a complete, engaging lesson in markdown for a mobile learner. Use this exact structure:

# ${data.lesson}

## Overview
2–3 sentences explaining what this lesson covers and why it matters.

## Key Concepts
- 4–7 bullet points of the most important ideas.

## Deep Dive
3–5 short subsections (### headings) explaining the concepts with examples. If the topic involves code, include fenced code blocks with a language tag. If it involves steps, use numbered lists.

## Real-World Example
A concrete scenario or worked example that shows the concept in action.

## Practice
2–3 short exercises the learner can try right now.

## Recap
3 bullet takeaways.

Keep it accurate, clear, and friendly. Assume the learner is a beginner unless the lesson title suggests otherwise.`;

    const lesson = await callGateway({
      model: MODEL,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: `Course: ${data.course}\nLesson: ${data.lesson}` },
      ],
    });

    const quizSys = `Create a 3-question multiple-choice quiz for this lesson. Respond ONLY with valid JSON:
{
  "questions": [
    { "q": "question text", "options": ["A","B","C","D"], "answer": 0, "why": "brief explanation" }
  ]
}
"answer" is the index (0-3) of the correct option. Exactly 4 options per question.`;
    const quizText = await callGateway({
      model: MODEL,
      messages: [
        { role: "system", content: quizSys },
        { role: "user", content: `Course: ${data.course}\nLesson: ${data.lesson}` },
      ],
      response_format: { type: "json_object" },
    });
    let quiz: { questions: Array<{ q: string; options: string[]; answer: number; why: string }> } =
      { questions: [] };
    try {
      quiz = JSON.parse(quizText);
    } catch {
      /* keep empty */
    }

    return { lesson, quiz };
  });
