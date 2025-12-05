import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = await getServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", "http://localhost:3000"));
}