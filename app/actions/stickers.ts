// app/actions/stickers.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";

const ALLOWED = new Set(["fire","star","trophy","party","smile","thumb"]);

export async function toggleSticker(formData: FormData) {
  const type = String(formData.get("type") || "");
  const hypeId = String(formData.get("hypeId") || "");
  if (!ALLOWED.has(type) || !hypeId) return { ok: false, error: "bad-input" };

  const supabase = await getServerClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return { ok: false, error: "not-authenticated" };

  // Optional simple rate cap: max 20 reactions in the last 24h
  const { count } = await supabase
    .from("sticker_reactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - 24*60*60*1000).toISOString());

  if ((count ?? 0) >= 20) return { ok: false, error: "rate-limited" };

  // Toggle: if exists -> delete, else -> insert
  const { data: existing } = await supabase
    .from("sticker_reactions")
    .select("id")
    .eq("hype_id", hypeId)
    .eq("user_id", user.id)
    .eq("type", type)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("sticker_reactions")
      .delete()
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/feed");
    return { ok: true, added: false };
  } else {
    const { error } = await supabase
      .from("sticker_reactions")
      .insert({ hype_id: hypeId, user_id: user.id, type });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/feed");
    return { ok: true, added: true };
  }
}