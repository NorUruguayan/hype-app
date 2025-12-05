"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import EmojiPicker from "@/components/EmojiPicker.client";
import TemplatesMenu from "@/components/TemplatesMenu.client";

type Props = {
  action: (formData: FormData) => Promise<void>;
  initialText?: string;
};

const MAX = 280;
const PROMPTS = [
  "One small win I'll get today is…",
  "I'm grateful for…",
  "Today I'll make progress by…",
  "I'm hyped about…",
  "Shoutout to ____ for…",
];

type Vibe = "grind" | "grateful" | "fitness" | "learning" | "shoutout";

/** Tiny, dependency-free confetti */
function useConfetti() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const COLORS = [
      "var(--brand-1)",
      "var(--brand-2)",
      "var(--brand-3)",
      "rgba(255,255,255,.9)",
    ];

    type P = { x: number; y: number; vx: number; vy: number; r: number; c: string; a: number; spin: number; angle: number; };
    const parts: P[] = [];
    const make = (n: number) => {
      for (let i = 0; i < n; i++) {
        parts.push({
          x: innerWidth / 2 + (Math.random() - 0.5) * 80,
          y: innerHeight / 2,
          vx: (Math.random() - 0.5) * 6,
          vy: - (Math.random() * 6 + 6),
          r: Math.random() * 4 + 3,
          c: COLORS[(Math.random() * COLORS.length) | 0],
          a: 1,
          spin: (Math.random() - 0.5) * 0.3,
          angle: Math.random() * Math.PI,
        });
      }
    };

    make(140); // initial burst

    const GRAV = 0.22;
    const DRAG = 0.995;
    const FADE = 0.012;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      parts.forEach((p) => {
        p.vx *= DRAG;
        p.vy = p.vy * DRAG + GRAV;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.a -= FADE;

        if (p.a <= 0) p.a = 0;

        ctx.save();
        ctx.globalAlpha = p.a;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        // squares/rectangles (some tiny)
        const w = p.r + Math.random() * 2;
        const h = p.r + Math.random() * 4;
        ctx.fillStyle = p.c;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
      });

      // remove dead
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.a <= 0 || p.y > innerHeight + 60) parts.splice(i, 1);
      }

      if (parts.length === 0) {
        // auto-stop after last particle
        setActive(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("resize", resize);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return {
    ConfettiCanvas: () => (
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60]"
        style={{ mixBlendMode: "normal" }}
      />
    ),
    fire: () => setActive(true),
    active,
  };
}

export default function DailyHypeComposer({ action, initialText = "" }: Props) {
  const [text, setText] = useState(initialText);
  const [vibe, setVibe] = useState<Vibe>("grind");
  const [left, setLeft] = useState(MAX);
  const formRef = useRef<HTMLFormElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const { ConfettiCanvas, fire: fireConfetti, active: confettiActive } = useConfetti();

  useEffect(() => setLeft(MAX - text.length), [text]);

  const insertAtCursor = useCallback((s: string) => {
    const el = taRef.current;
    if (!el) {
      setText((t) => (t ? `${t} ${s}` : s));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + s + el.value.slice(end);
    setText(next);
    const pos = start + s.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }, []);

  function randomPrompt() {
    insertAtCursor(PROMPTS[(Math.random() * PROMPTS.length) | 0]);
  }

  // Allow Ctrl/⌘ + Enter to submit
  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const cmdOrCtrl = e.metaKey || e.ctrlKey;
    if (cmdOrCtrl && (e.key === "Enter" || e.key === "Return")) {
      e.preventDefault();
      if (text.trim().length >= 5) formRef.current?.requestSubmit();
    }
  }

  // Confetti on submit (button or keyboard)
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    if (text.trim().length >= 5 && !confettiActive) {
      // fire immediately; navigation will occur after the server action
      fireConfetti();
    }
    // DO NOT prevent default; let the server action run
  };

  const vibeOptions: Array<[Vibe, string, string]> = [
    ["grind", "Grind", "💪"],
    ["grateful", "Grateful", "🌿"],
    ["fitness", "Fitness", "🏃"],
    ["learning", "Learning", "📚"],
    ["shoutout", "Shoutout", "📣"],
  ];

  return (
    <div className="ui-card p-4 md:p-5 space-y-3 relative overflow-hidden">
      {/* Confetti overlay (only when active) */}
      {confettiActive && <ConfettiCanvas />}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs opacity-80">
          <span>Today’s vibe</span>
          {vibeOptions.map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setVibe(key)}
              className={`chip ${vibe === key ? "chip-active" : ""}`}
              title={label}
            >
              <span className="mr-1">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-1">
          <TemplatesMenu currentText={text} onInsert={(t) => setText(t)} />
          <EmojiPicker onPick={(e) => insertAtCursor(e)} />
        </div>
      </div>

      {/* Form */}
      <form ref={formRef} action={action} onSubmit={onSubmit} className="space-y-3">
        <input type="hidden" name="content" value={`[${vibe}] ${text}`.trim()} />

        <div className="relative">
          <textarea
            ref={taRef}
            className="h-36 w-full resize-none rounded-xl bg-neutral-950/60 p-4 text-[15px] leading-6 outline-none ring-1 ring-white/10 focus:ring-white/20"
            placeholder="Ship the PR. Crush the workout. Ace the interview."
            maxLength={MAX}
            value={text}
            onKeyDown={handleKey}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="pointer-events-none absolute bottom-2 right-3 text-xs opacity-60">
            {left}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs opacity-70">Quick prompts</div>
          <div className="hidden text-xs opacity-60 md:block">
            Pro tip: <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Enter</kbd> to post
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              className="btn-ghost text-sm whitespace-nowrap"
              onClick={() => insertAtCursor(p)}
            >
              {p}
            </button>
          ))}
          <button type="button" className="btn-ghost text-sm whitespace-nowrap" onClick={randomPrompt}>
            🎲 Random
          </button>
        </div>

        <div className="mt-1 flex items-center justify-end gap-3">
          <button className="btn-cta" type="submit" disabled={text.trim().length < 5}>
            Post today’s hype
          </button>
          <button className="btn-ghost" type="button" onClick={() => setText("")}>
            Clear
          </button>
          <Link href="/feed" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}