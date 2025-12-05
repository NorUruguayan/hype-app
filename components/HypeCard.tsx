"use client";

import * as React from "react";
import StickerBar from "@/components/StickerBar.autoload.client";

// 1. Export the Hype type definition for the parent to use
export type Hype = {
  id: string;
  content: string;
  created_at: string | Date;
  author: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
};

// 2. Update Props to accept the 'hype' object
type Props = {
  hype: Hype;
  isDaily?: boolean;
  onComment?: () => void;
  onShare?: () => void;
};

export default function HypeCard({
  hype,
  isDaily,
  onComment,
  onShare,
}: Props) {
  // 3. Destructure the hype object to get the data we need
  const { id, content, created_at, author } = hype;

  // 4. Map the data to the variables your UI expects
  const authorName = author.display_name || author.username || "Anonymous";
  const handle = author.username ? `@${author.username}` : undefined;
  const avatarUrl = author.avatar_url;
  const text = content;
  
  const dateStr = created_at
    ? new Date(created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : undefined;

  return (
    <article className={`ui-card p-4 ${isDaily ? "confetti-pop" : ""}`}>
      <header className="mb-2 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={authorName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-semibold">{authorName?.[0]?.toUpperCase() ?? "U"}</span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate font-semibold">{authorName}</div>
            {isDaily && <span className="badge-daily">DAILY</span>}
          </div>
          <div className="text-xs text-white/60">
            {handle && <span className="mr-2 truncate">{handle}</span>}
            {dateStr && <span>{dateStr}</span>}
          </div>
        </div>
      </header>

      <div className="whitespace-pre-wrap break-words text-[15px] leading-6 text-white/95">
        {text}
      </div>

      {/* Stickers - passing the ID from the hype object */}
      <StickerBar hypeId={id} />

      <footer className="mt-3 flex gap-2">
        <button className="btn-ghost" onClick={onComment}>Comment</button>
        <button className="btn-ghost" onClick={onShare}>Share</button>
      </footer>
    </article>
  );
}