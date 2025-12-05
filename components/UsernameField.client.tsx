// components/UsernameField.client.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Supports BOTH controlled and uncontrolled usage:
 *
 * Controlled (your current usage):
 *   <UsernameField
 *     value={username}
 *     onChange={setUsername}
 *     initial={initialUsername}
 *     excludeUserId={userId}
 *     requireNonEmpty
 *     onStatusChange={setUsernameOK}  // boolean|null (ok / invalid-or-taken / idle)
 *   />
 *
 * Uncontrolled (simple):
 *   <UsernameField defaultValue="alex" currentUserId={userId} />
 *
 * In both cases it debounces a uniqueness check against `profiles.username`
 * and shows a small status pill on the right of the input.
 */

const VALID = /^[a-z0-9_]+$/;

type UncontrolledProps = {
  /** name for the <input>, defaults to "username" */
  name?: string;
  /** initial value (uncontrolled) */
  defaultValue?: string;
  /** your current user id to ignore your row in uniqueness query */
  currentUserId?: string;
  /** max length, default 30 */
  maxLength?: number;
};

type ControlledProps = {
  /** controlled value */
  value: string;
  /** controlled setter (receives lowercase version) */
  onChange: (next: string) => void;
  /** legacy prop your code uses for server-provided initial */
  initial?: string;
  /** row id to ignore in uniqueness query */
  excludeUserId?: string;
  /** if true, empty is immediately invalid */
  requireNonEmpty?: boolean;
  /** callback with status: true (ok), false (invalid/taken), null (idle/checking) */
  onStatusChange?: (ok: boolean | null) => void;
  /** optional input name + maxLength to keep the same signature as uncontrolled */
  name?: string;
  maxLength?: number;
};

type Props = UncontrolledProps | ControlledProps;

export default function UsernameField(props: Props) {
  const isControlled = Object.prototype.hasOwnProperty.call(props, "value");
  const supabase = useMemo(() => createClient(), []);

  // Resolve initial/current values across both modes
  const initialFromProps =
    (isControlled ? (props as ControlledProps).initial : (props as UncontrolledProps).defaultValue) ?? "";
  const currentUserId = isControlled
    ? (props as ControlledProps).excludeUserId
    : (props as UncontrolledProps).currentUserId;
  const name = props.name ?? "username";
  const maxLength = props.maxLength ?? 30;

  // local state for uncontrolled; for controlled we echo props.value
  const [uncontrolled, setUncontrolled] = useState(initialFromProps);
  const value = (isControlled ? (props as ControlledProps).value : uncontrolled) || "";

  // status UI
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const [message, setMessage] = useState<string>("");

  // debounce handle
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    if (tRef.current) window.clearTimeout(tRef.current);
    const v = value.trim();

    // required empty handling (controlled only)
    const requireNonEmpty = isControlled ? !!(props as ControlledProps).requireNonEmpty : false;
    if (!v) {
      if (requireNonEmpty) {
        setStatus("invalid");
        setMessage("Required.");
        (props as ControlledProps).onStatusChange?.(false);
      } else {
        setStatus("idle");
        setMessage("");
        if (isControlled) (props as ControlledProps).onStatusChange?.(null);
      }
      return;
    }

    // local validation first
    if (v.length < 3) {
      setStatus("invalid");
      setMessage("Must be at least 3 characters.");
      if (isControlled) (props as ControlledProps).onStatusChange?.(false);
      return;
    }
    if (!VALID.test(v)) {
      setStatus("invalid");
      setMessage("Use lowercase letters, numbers, or underscore.");
      if (isControlled) (props as ControlledProps).onStatusChange?.(false);
      return;
    }

    // Uniqueness check (debounced)
    setStatus("checking");
    setMessage("Checking…");
    if (isControlled) (props as ControlledProps).onStatusChange?.(null);

    tRef.current = window.setTimeout(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", v)
        .limit(2);

      if (error) {
        // On error, don't block the user
        setStatus("idle");
        setMessage("");
        if (isControlled) (props as ControlledProps).onStatusChange?.(null);
        return;
      }

      const others = (data ?? []).filter((r: any) => r.id !== currentUserId);
      if (others.length > 0) {
        setStatus("taken");
        setMessage("That handle is already taken.");
        if (isControlled) (props as ControlledProps).onStatusChange?.(false);
      } else {
        setStatus("ok");
        setMessage("Looks good!");
        if (isControlled) (props as ControlledProps).onStatusChange?.(true);
      }
    }, 350);

    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, [supabase, value, isControlled, currentUserId, props]);

  // tone for the right-side hint
  const tone =
    status === "ok"
      ? "text-green-300"
      : status === "taken" || status === "invalid"
      ? "text-red-300"
      : "text-white/60";

  return (
    <div>
      <div className="relative">
        <input
          name={name}
          value={value}
          maxLength={maxLength}
          onChange={(e) => {
            const next = e.target.value.toLowerCase();
            if (isControlled) (props as ControlledProps).onChange(next);
            else setUncontrolled(next);
          }}
          placeholder="username"
          autoComplete="off"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 pl-8"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">@</span>

        {/* status pill */}
        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${tone}`}>
          {status === "checking"
            ? "Checking…"
            : status === "ok"
            ? "Available ✓"
            : status === "taken"
            ? "Taken"
            : status === "invalid"
            ? "Invalid"
            : ""}
        </span>
      </div>

      <p className="text-xs opacity-60 mt-1">
        Lowercase letters, numbers, or underscore.
        {message && <span className={`ml-1 ${tone}`}>{message}</span>}
      </p>
    </div>
  );
}