// app/me/page.tsx
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/server";

export default async function MePage() {
  const { supabase, user } = await getServerUser();
  if (!user) redirect("/login");

  // Load my profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  // If no username yet, send user to Settings to finish profile
  if (!profile?.username) {
    redirect("/settings?error=" + encodeURIComponent("Pick a username to finish your profile."));
  }

  // Send to public profile
  redirect(`/u/${profile.username}`);
}