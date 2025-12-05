"use client";

import dynamic from "next/dynamic";

type Props = {
  userId: string;
  timestamps: string[];
};

// Client-side dynamic import with ssr:false (allowed in Next 15)
const Inner = dynamic(() => import("./KeepStreakNudge.client"), {
  ssr: false,
  loading: () => (
    <div className="ui-card p-4 text-sm opacity-80">Keep your streak 🔥</div>
  ),
});

export default function KeepStreakNudgeNoSSR(props: Props) {
  return <Inner {...props} />;
}