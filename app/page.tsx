// app/page.tsx
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await getServerClient();
  const { data } = await supabase.auth.getSession();

  // If logged in, send them to the feed. Otherwise show Discover (or /login if you prefer)
  if (data.session) {
    redirect("/feed");
  } else {
    redirect("/discover"); // or redirect("/login")
  }

  // This never renders because of redirects, but satisfies TS/Next
  return null;
}