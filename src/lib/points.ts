import { supabase } from "@/integrations/supabase/client";

export type PointsAction =
  | "signup"
  | "scan"
  | "chat"
  | "image_generated"
  | "lesson_completed"
  | "daily_login";

export const POINTS: Record<PointsAction, number> = {
  signup: 100,
  scan: 10,
  chat: 5,
  image_generated: 20,
  lesson_completed: 30,
  daily_login: 5,
};

/**
 * Award points to the current user. Safe to call from any authenticated context.
 * Uses SECURITY DEFINER RPC to update profiles.ai_points atomically.
 * Optional dedupe_key prevents double-awards (e.g. daily-login per day).
 */
export async function awardPoints(
  action: PointsAction,
  amount?: number,
  dedupeKey?: string,
): Promise<number | null> {
  try {
    const { data, error } = await supabase.rpc("award_points", {
      _action: action,
      _amount: amount ?? POINTS[action],
      _dedupe_key: dedupeKey ?? null,
    });
    if (error) {
      console.warn("awardPoints failed", action, error.message);
      return null;
    }
    return typeof data === "number" ? data : null;
  } catch (e) {
    console.warn("awardPoints exception", e);
    return null;
  }
}

export function todayKey(prefix: string): string {
  const d = new Date();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${prefix}:${iso}`;
}
