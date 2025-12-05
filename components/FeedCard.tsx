// components/FeedCard.tsx

type Props = {
  author: { name: string; handle: string; avatar?: string };
  /** Preferred: ISO or Date; shows relative time like "2h ago". */
  createdAt?: string | Date;
  /** Fallback: plain string time; used when createdAt is missing/invalid. */
  time?: string;
  text: string;
  /** Optional group context for group posts */
  group?: { name: string; slug: string };
  /** Optional kind badge */
  kind?: "group_post" | "daily_hype";
  /** Show a thin divider on top (useful when rendering lists). */
  withDivider?: boolean;
};

/* ---------------- Time helpers ---------------- */

function pad2(n: number) { return n.toString().padStart(2, "0"); }
function ampm(h: number) { return h >= 12 ? "PM" : "AM"; }
function to12h(h: number) { const r = h % 12; return r === 0 ? 12 : r; }
function monthShort(m: number) {
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m]!;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}
function yesterdayOf(b: Date) { const y = new Date(b); y.setDate(y.getDate() - 1); return y; }

function prettyAbsolute(d: Date) {
  return `${monthShort(d.getMonth())} ${d.getDate()}, ${to12h(d.getHours())}:${pad2(
    d.getMinutes()
  )} ${ampm(d.getHours())}`;
}

function formatWhen(createdAt?: string | Date, fallback?: string) {
  if (!createdAt) return fallback ?? "just now";
  const d = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (isNaN(d.getTime())) return fallback ?? "just now";

  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));

  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24 && sameDay(d, now)) return `${diffHr}h ago`;

  if (sameDay(d, yesterdayOf(now))) {
    return `Yesterday ${to12h(d.getHours())}:${pad2(d.getMinutes())} ${ampm(d.getHours())}`;
  }
  return prettyAbsolute(d);
}

/* ---------------- UI ---------------- */

export default function FeedCard({
  author,
  createdAt,
  time,
  text,
  group,
  kind,
  withDivider = false,
}: Props) {
  const when = formatWhen(createdAt, time);

  return (
    <article
      className={[
        "relative rounded-2xl border border-white/10",
        "bg-gradient-to-b from-white/[0.06] to-transparent",
        "p-4 transition-shadow",
        "hover:shadow-[0_6px_30px_-10px_rgba(0,0,0,0.45)]",
        "focus-within:shadow-[0_6px_32px_-10px_rgba(0,0,0,0.55)]",
        withDivider ? "before:absolute before:inset-x-4 before:-top-px before:h-px before:bg-white/8 before:content-['']" : "",
      ].join(" ")}
    >
      {/* subtle edge sheen on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity hover:opacity-100"
        style={{ background: "radial-gradient(120% 90% at 10% 0%, rgba(255,255,255,0.06), transparent 60%)" }}
      />

      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/15 shadow-sm">
          {author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
          ) : (
            <div
              className="grid h-full w-full place-items-center text-sm font-bold text-white/90
                         bg-[radial-gradient(120%_120%_at_10%_0%,#ffd27a,transparent_40%),radial-gradient(120%_120%_at_90%_100%,#4ade80,transparent_40%),linear-gradient(135deg,#0ea5e9,#22d3ee)]"
            >
              {(author.name?.[0] ?? "U").toUpperCase()}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10" />
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-tight">
            {author.name}
          </div>
          <div className="truncate text-xs text-white/70">
            {author.handle}
            {group ? (
              <>
                {" "}in{" "}
                <a className="underline underline-offset-2 hover:opacity-90" href={`/g/${group.slug}`}>
                  {group.name}
                </a>
              </>
            ) : null}
            {" "}&bull; {when}
          </div>
        </div>

        {kind === "daily_hype" ? (
          <span className="ml-auto rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-white/85">
            Daily hype
          </span>
        ) : null}
      </div>

      {/* Body */}
      <p className="whitespace-pre-wrap text-[15px] leading-6 text-white/90">
        {text}
      </p>

      {/* Actions (no flame icon) */}
      <div className="mt-4 flex items-center gap-2">
        <button
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-black
                     transition-transform active:scale-[0.98]
                     bg-amber-400 hover:bg-amber-300"
          aria-label="Hype"
        >
          Hype
        </button>
        <button
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5 active:scale-[0.98] transition"
          aria-label="Comment"
        >
          Comment
        </button>
        <button
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5 active:scale-[0.98] transition"
          aria-label="Share"
        >
          Share
        </button>
      </div>
    </article>
  );
}