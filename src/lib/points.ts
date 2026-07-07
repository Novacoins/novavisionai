import { awardPointsFn } from "./points.functions";

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
 * Award points to the current authenticated user. Amount is decided server-side
 * from an allow-list; the client cannot influence how many points are awarded.
 * Optional dedupeKey prevents double-awards. daily_login is auto-deduped per day.
 */
export async function awardPoints(
  action: PointsAction,
  _amount?: number,
  dedupeKey?: string,
): Promise<number | null> {
  try {
    const total = await awardPointsFn({ data: { action, dedupeKey } });
    return typeof total === "number" ? total : null;
  } catch (e) {
    console.warn("awardPoints failed", action, e);
    return null;
  }
}

export function todayKey(prefix: string): string {
  const d = new Date();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${prefix}:${iso}`;
}
