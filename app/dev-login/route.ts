// app/dev-login/route.ts
import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = await getServerClient();

  // Anonymous sign in
  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    return new NextResponse("Anon login failed: " + error.message, { status: 500 });
  }

  // Redirect into your app
  return NextResponse.redirect(new URL("/me", "http://localhost:3000"));
}