// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// routes that should NEVER be treated as usernames
const RESERVED = new Set([
  "login",
  "signup",
  "demo",
  "landing",
  "u",
  "auth",
  "api",
  "daily",
  "onboarding",
  "discover",
  "invite",
  "settings",
  "feed",
  "notifications",   // ✅ add this
  // optional extras if you have them:
  "me",
  "reset-password",
  "dev-login",
  "dev-logout",
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Decide if we need a rewrite
  let rewriteUrl: URL | null = null;

  // 1) /@username  →  /u/username
  const at = pathname.match(/^\/@([a-z0-9_]{3,30})$/i);
  if (at) {
    const handle = at[1].toLowerCase();
    const url = req.nextUrl.clone();
    url.pathname = `/u/${handle}`;
    rewriteUrl = url;
  }

  // 2) bare /username → /u/username (skip reserved)
  if (!rewriteUrl) {
    const bare = pathname.match(/^\/([a-z0-9_]{3,30})$/i);
    if (bare) {
      const handle = bare[1].toLowerCase();
      if (!RESERVED.has(handle)) {
        const url = req.nextUrl.clone();
        url.pathname = `/u/${handle}`;
        rewriteUrl = url;
      }
    }
  }

  // Create the response we'll return
  const res = rewriteUrl ? NextResponse.rewrite(rewriteUrl) : NextResponse.next();

  // Bind Supabase to THIS response so any refreshed cookies are attached
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  // This “pings” the session and refreshes cookies if needed
  await supabase.auth.getSession();

  return res;
}

// Don’t run on Next internals, api, auth, or static files
export const config = {
  matcher: ["/((?!_next|api|auth|.*\\..*).*)"],
};