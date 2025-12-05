import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function makeCode(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized (no Supabase session found)' }, { status: 401 });
    }

    // Reuse latest
    const { data: existing, error: exErr } = await supabase
      .from('invites')
      .select('code, created_at')
      .eq('inviter_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (exErr) {
      return NextResponse.json({ error: `Select failed: ${exErr.message}` }, { status: 500 });
    }

    let code = existing?.code as string | undefined;
    let lastInsertErr: string | undefined;

    if (!code) {
      for (let i = 0; i < 3 && !code; i++) {
        const attempt = makeCode(8);
        const { data, error } = await supabase
          .from('invites')
          .insert({ inviter_id: user.id, code: attempt })
          .select('code')
          .maybeSingle();

        if (!error && data?.code) {
          code = data.code;
          break;
        }
        lastInsertErr = error?.message || 'unknown insert error';
      }

      if (!code) {
        return NextResponse.json({ error: `Insert failed: ${lastInsertErr}` }, { status: 500 });
      }
    }

    const url = `${req.nextUrl.origin}/invite/${code}`;
    return NextResponse.json({ code, url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}