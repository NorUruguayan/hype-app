// components/StickerBar.tsx (Server Component)
import { getServerClient } from "@/lib/supabase/server";
import StickerBarClient from "./StickerBar.client";

const TYPES = ["fire","star","trophy","party","smile","thumb"] as const;

export default async function StickerBar({ hypeId }: { hypeId: string }) {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // counts
  const { data: rows } = await supabase
    .from("sticker_reaction_counts")
    .select("type, count")
    .eq("hype_id", hypeId);

  const initial = Object.fromEntries(TYPES.map(t => [t, 0])) as Record<string, number>;
  for (const r of rows ?? []) { initial[r.type as string] = r.count as number; }

  // which ones I reacted to
  const reacted = Object.fromEntries(TYPES.map(t => [t, false])) as Record<string, boolean>;
  if (user) {
    const { data: mine } = await supabase
      .from("sticker_reactions")
      .select("type")
      .eq("hype_id", hypeId)
      .eq("user_id", user.id);
    for (const r of mine ?? []) reacted[r.type as string] = true;
  }

  return (
    <StickerBarClient
      hypeId={hypeId}
      userId={user?.id ?? null}
      initial={initial}
      initiallyReacted={reacted}
    />
  );
}