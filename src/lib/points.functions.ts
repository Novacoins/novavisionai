import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ActionEnum = z.enum([
  "signup",
  "scan",
  "chat",
  "image_generated",
  "lesson_completed",
  "daily_login",
]);

const InputSchema = z.object({
  action: ActionEnum,
  dedupeKey: z.string().min(1).max(200).optional(),
});

export const awardPointsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: total, error } = await supabaseAdmin.rpc("award_points", {
      _user_id: context.userId,
      _action: data.action,
      _dedupe_key: data.dedupeKey ?? undefined,
    });
    if (error) {
      throw new Error(error.message);
    }
    return typeof total === "number" ? total : 0;
  });
