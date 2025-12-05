// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import RouteBackdrop from "@/components/RouteBackdrop.client";
import { getServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "HYPED",
  description: "Turn moments into momentum.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- Server-side: read user + basic “new groups” signal
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | undefined = undefined;
  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle();
    username = prof?.username ?? undefined;
  }

  // Simple “new things to discover” heuristic:
  // any groups created in the last 7 days => show dot.
  // (You can later swap this for “unseen by user” logic.)
  let discoverHasNew = false;
  {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sinceISO = since.toISOString();

    const { count } = await supabase
      .from("hype_groups")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceISO);

    discoverHasNew = (count ?? 0) > 0;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full text-neutral-100 antialiased no-tap-highlight">
        {/* sets data-page on <body> so the CSS below can theme per-route */}
        <RouteBackdrop />

        <Header />
        <main className="app-container pb-24 md:pb-10 pt-6">{children}</main>

        {/* Mobile bottom nav */}
        <MobileNav
          username={username}
          discoverHasNew={discoverHasNew}
        />
      </body>
    </html>
  );
}