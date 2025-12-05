// app/auth/signout-others/route.ts
import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await getServerClient();
  const { error } = await supabase.auth.signOut({ scope: "others" });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}