// components/SettingsPreviewCard.tsx
"use client";

import * as React from "react";

type Props = {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl?: string;
};

export default function SettingsPreviewCard({
  displayName,
  username,
  bio,
  avatarUrl,
}: Props) {
  const initial = (displayName || username || "U").slice(0, 1).toUpperCase();

  return (
    <div className="ui-card p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName || username || "user"}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="text-sm font-semibold">{initial}</span>
          )}
        </div>

        <div className="min-w-0">
          <div className="font-semibold truncate">{displayName || "Your name"}</div>
          <div className="text-xs text-white/60 truncate">@{username || "username"}</div>
        </div>
      </div>

      <div className="mt-3 text-sm text-white/80 min-h-[1.5rem]">
        {bio || <span className="opacity-50">Tell people what you’re hyped about…</span>}
      </div>
    </div>
  );
}