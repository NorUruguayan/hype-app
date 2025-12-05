// supabase/functions/profile-privacy/index.ts
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Verify webhook with a shared secret you set in Auth → Hooks
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;
const SUPABASE_URL   = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_KEY);

type HookBody = {
  type?: string;        // e.g. "USER_CREATED"
  record?: { id: string; email?: string | null };
};

serve(async (req) => {
  try {
    // Simple signature check
    const sig = req.headers.get("x-webhook-secret");
    if (!WEBHOOK_SECRET || sig !== WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const body = (await req.json()) as HookBody;
    if (body?.type !== "USER_CREATED" || !body?.record?.id) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });
    }

    const uid = body.record.id;

    // Upsert the profile with private defaults
    const { error } = await admin
      .from("profiles")
      .upsert(
        {
          user_id: uid,
          username: null,
          display_name: null,
          bio: null,
          avatar_url: null,
          banner_url: null,
          default_visibility: "private",
          discoverable: false,
          allow_messages: true,
          show_activity_status: true,
          hide_counts: false,
        },
        { onConflict: "user_id" },
      );

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? "Unknown error" }), { status: 500 });
  }
});