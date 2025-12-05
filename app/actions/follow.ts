// app/actions/follow.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";

export type ToggleFollowResult = {
  ok: boolean;
  following?: boolean;
  error?: string;
};

export async function toggleFollow(formData: FormData): Promise<ToggleFollowResult> {
  const targetId = String(formData.get("targetId") || "");
  if (!targetId) return { ok: false, error: "missing-target" };

  const supabase = await getServerClient();

  // who is logged in?
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return { ok: false, error: "not-authenticated" };

  const me = user.id;
  if (me === targetId) return { ok: false, error: "cannot-follow-self" };

  // check if following already
  const { data: existing, error: findErr } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", me)
    .eq("followee_id", targetId)
    .maybeSingle();

  if (findErr) return { ok: false, error: findErr.message };

  if (existing) {
    // UNFOLLOW
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", me)
      .eq("followee_id", targetId);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/discover");
    return { ok: true, following: false };
  }

  // FOLLOW
  const { error: insErr } = await supabase
    .from("follows")
    .insert({ follower_id: me, followee_id: targetId });

  if (insErr) return { ok: false, error: insErr.message };

  // Fetch my profile so we can put friendly text in the notif
  const { data: meProf } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("user_id", me)
    .maybeSingle();

  // Fire a notification to the followee
  // (RLS must allow inserts; see SQL notes below)
  await supabase.from("notifications").insert({
    user_id: targetId,
    type: "new_follower",
    is_read: false,
    data: {
      from_user_id: me,
      from_username: meProf?.username ?? null,
      from_display_name: meProf?.display_name ?? null,
    },
  });

  revalidatePath("/discover");
  return { ok: true, following: true };
}