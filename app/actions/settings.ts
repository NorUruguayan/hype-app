"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";

/** Checkbox helpers: HTML sends "on" (or null when unchecked) */
function bool(v: FormDataEntryValue | null): boolean {
  if (v === null) return false;
  const s = String(v).toLowerCase();
  return s === "on" || s === "true" || s === "1" || s === "yes";
}

/** Save profile basics (display name, username, bio, avatar) */
export async function saveProfile(formData: FormData) {
  const supabase = await getServerClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) redirect("/login");

  const display_name = String(formData.get("display_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatar_url = String(formData.get("avatar_url") ?? "").trim() || null;

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        display_name,
        username,
        bio,
        avatar_url,
      },
      { onConflict: "user_id" }
    );

  if (error) return { ok: false as const, error: error.message };

  // Revalidate pages that display profile info
  revalidatePath("/settings");
  revalidatePath("/me");
  revalidatePath("/", "layout");

  return { ok: true as const };
}

/** Save privacy / notifications preferences */
export async function savePrefs(formData: FormData) {
  const supabase = await getServerClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) redirect("/login");

  const theme = (String(formData.get("theme") ?? "system") ||
    "system") as "system" | "light" | "dark";

  const discoverable = bool(formData.get("discoverable"));
  const allow_dm = bool(formData.get("allow_dm"));
  const show_activity = bool(formData.get("show_activity"));
  const hide_counts = bool(formData.get("hide_counts"));

  const email_updates = bool(formData.get("email_updates"));
  const email_mentions = bool(formData.get("email_mentions"));
  const email_followers = bool(formData.get("email_followers"));

  const { error } = await supabase
    .from("preferences")
    .upsert(
      {
        user_id: user.id,
        theme,
        discoverable,
        allow_dm,
        show_activity,
        hide_counts,
        email_updates,
        email_mentions,
        email_followers,
      },
      { onConflict: "user_id" }
    );

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/settings");
  return { ok: true as const };
}

/** NEW: Save discovery tags (city, school) */
export async function saveDiscoveryTags(formData: FormData) {
  const supabase = await getServerClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) redirect("/login");

  const city = String(formData.get("city") ?? "").trim() || null;
  const school = String(formData.get("school") ?? "").trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({ city, school })
    .eq("user_id", user.id);

  if (error) return { ok: false as const, error: error.message };

  // These affect group suggestions
  revalidatePath("/discover");
  revalidatePath("/settings");
  return { ok: true as const };
}

/** NEW: Refresh the top_dm_contacts MV via RPC */
export async function refreshDmAnalytics() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("refresh_top_dm_contacts");
  if (error) return { ok: false as const, error: error.message };

  // Discover is server-rendered; no need to revalidate, but harmless:
  revalidatePath("/discover");
  return { ok: true as const };
}

/** Optional utilities used by the “Advanced” section */
export async function signOutOthers() {
  const supabase = await getServerClient();
  await supabase.auth.signOut({ scope: "others" });
  return { ok: true as const };
}

export async function deleteAccount() {
  // Implementation depends on your auth model / RLS. Stub here:
  return { ok: false as const, error: "not-implemented" };
}