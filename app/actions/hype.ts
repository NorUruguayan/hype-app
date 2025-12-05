// app/actions/hype.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";

export async function createHype(formData: FormData) {
  const content = String(formData.get("content") || "").trim();
  if (!content) return { ok: false, error: "Say something inspiring!" };

  const supabase = await getServerClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return { ok: false, error: "You must be signed in." };

  // MVP: hype to yourself; if you later add a "target", switch this
  const authorId = user.id;
  const targetId = user.id;

  const { error } = await supabase
    .from("hypes")
    .insert({
      author_user_id: authorId,
      target_user_id: targetId,
      content,
      visibility: "public",
    });

  if (error) return { ok: false, error: error.message };

  // If hyping someone else later, notify them
  if (targetId !== authorId) {
    const { data: meProf } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("user_id", authorId)
      .maybeSingle();

    await supabase.from("notifications").insert({
      user_id: targetId,
      type: "new_hype",
      is_read: false,
      data: {
        from_user_id: authorId,
        from_username: meProf?.username ?? null,
        from_display_name: meProf?.display_name ?? null,
      },
    });
  }

  revalidatePath("/feed");
  return { ok: true };
}