// app/actions/daily.ts
"use server";

import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";

export async function createDailyHype(formData: FormData) {
  const content = String(formData.get("content") || "").trim();
  if (!content) return { ok: false, error: "empty" };

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const { error } = await supabase
    .from("daily_hypes")
    .insert({ user_id: user.id, content });

  if (error) return { ok: false, error: error.message };

  // ✅ Success → land on Feed with a one-shot toast
  redirect("/feed?toast=streak");
}