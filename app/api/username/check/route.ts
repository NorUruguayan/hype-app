// app/api/username/check/route.ts
import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  // Validate syntax quickly
  if (!q || !/^[a-z0-9_]{3,20}$/.test(q)) {
    return NextResponse.json({ ok: true, available: false, reason: "invalid" });
  }

  const supabase = await getServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username", q)
    .maybeSingle();

  const available = !data;
  return NextResponse.json({ ok: true, available });
}