// app/settings/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

function mustBeSignedIn() {
  return getServerClient().then(async (supabase) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return { supabase, user };
  });
}

/** PROFILE (with optional avatar upload) */
export async function saveProfile(formData: FormData) {
  const { supabase, user } = await mustBeSignedIn();

  const display_name = String(formData.get("display_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const bio = String(formData.get("bio") ?? "").trim();
  const file = formData.get("avatar") as File | null;

  // username syntax guard
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    throw new Error("Invalid username format");
  }

  // Optional avatar upload
  let avatar_url: string | undefined;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    avatar_url = data.publicUrl;
  }

  // Upsert profile
  const { error: pErr } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      display_name,
      username,
      bio,
      ...(avatar_url ? { avatar_url } : {}),
    },
    { onConflict: "user_id" }
  );
  if (pErr) throw new Error(pErr.message);

  revalidatePath("/settings");
  return { ok: true as const, message: "Profile saved" };
}

/** PRIVACY + THEME */
export async function savePrivacy(formData: FormData) {
  const { supabase, user } = await mustBeSignedIn();

  const theme =
    (formData.get("theme") as "system" | "light" | "dark" | null) ?? "system";
  const discoverable = formData.get("discoverable") === "on";
  const allow_dm = formData.get("allow_dm") === "on";
  const show_activity = formData.get("show_activity") === "on";
  const hide_counts = formData.get("hide_counts") === "on";

  const { error } = await supabase.from("preferences").upsert(
    {
      user_id: user.id,
      theme,
      discoverable,
      allow_dm,
      show_activity,
      hide_counts,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  return { ok: true as const, message: "Privacy updated" };
}

/** EMAIL NOTIFICATIONS */
export async function saveNotifications(formData: FormData) {
  const { supabase, user } = await mustBeSignedIn();

  const email_updates = formData.get("email_updates") === "on";
  const email_mentions = formData.get("email_mentions") === "on";
  const email_followers = formData.get("email_followers") === "on";

  const { error } = await supabase.from("preferences").upsert(
    {
      user_id: user.id,
      email_updates,
      email_mentions,
      email_followers,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  return { ok: true as const, message: "Notifications updated" };
}

/** SIGN OUT OTHER SESSIONS */
export async function signOutOthers() {
  const { supabase } = await mustBeSignedIn();
  const { error } = await supabase.auth.signOut({ scope: "others" as any });
  if (error) throw new Error(error.message);
  return { ok: true as const, message: "Other sessions signed out" };
}

/** DANGER ZONE — DELETE ACCOUNT */
export async function deleteAccount() {
  const { user } = await mustBeSignedIn();

  const admin = getAdminClient();

  // Best-effort: remove related rows first (ignore table errors if not present)
  const maybeDelete = async (sql: string, params: any[]) => {
    try {
      await admin.rpc("exec_sql", { sql_text: sql, sql_params: params }); // if you have an RPC to run raw SQL
    } catch {
      /* ignore if not set up */
    }
  };

  // Fallback: try deletes table-by-table where they exist
  const softDeletes = [
    admin.from("follows").delete().eq("follower_id", user.id),
    admin.from("follows").delete().eq("followee_id", user.id),
    admin.from("daily_hypes").delete().eq("user_id", user.id),
    admin.from("hype_actions").delete().eq("user_id", user.id),
    admin.from("preferences").delete().eq("user_id", user.id),
    admin.from("profiles").delete().eq("user_id", user.id),
  ];
  await Promise.allSettled(softDeletes);

  // Finally delete auth user
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) throw new Error(delErr.message);

  return { ok: true as const, message: "Your account was deleted." };
}