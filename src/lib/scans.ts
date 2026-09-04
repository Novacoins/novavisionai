import { supabase } from "@/integrations/supabase/client";
import type { AIResult } from "@/components/ScanResult";

export async function uploadScanImage(
  userId: string,
  dataUrl: string,
): Promise<{ path: string; signedUrl: string } | null> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("scan-images").upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) throw error;
    const { data: signed } = await supabase.storage
      .from("scan-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    return { path, signedUrl: signed?.signedUrl ?? "" };
  } catch (e) {
    console.error("upload failed", e);
    return null;
  }
}

export async function saveScan(args: {
  userId: string;
  result: AIResult;
  scanType: "general" | "food" | "plant";
  image?: { path: string; signedUrl: string } | null;
}) {
  const { data, error } = await supabase
    .from("scans")
    .insert({
      user_id: args.userId,
      title: args.result.title,
      category: args.result.category,
      scan_type: args.scanType,
      confidence: args.result.confidence,
      safety: args.result.safety,
      ai_result: args.result as never,
      image_path: args.image?.path ?? null,
      thumbnail_url: args.image?.signedUrl ?? null,
    })
    .select()
    .single();
  if (error) console.error(error);
  return data;
}

export async function refreshSignedUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from("scan-images").createSignedUrl(path, 60 * 60 * 24);
  return data?.signedUrl ?? null;
}
