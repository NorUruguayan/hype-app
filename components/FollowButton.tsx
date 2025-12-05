// components/FollowButton.tsx
"use client";

import { useState, useTransition } from "react";

type ToggleResult = {
    ok: boolean;
    following?: boolean;
    error?: string;
};

type Props = {
    targetId: string;
    initiallyFollowing: boolean;
    action: (formData: FormData) => Promise<ToggleResult>;
    disabled?: boolean;
    /** When true and not following yet, label shows "Follow back" */
    followBack?: boolean;
    // --- ADDED PROP: The callback the parent needs ---
    onToggle?: (nowFollowing: boolean) => void;
};

export default function FollowButton({
    targetId,
    initiallyFollowing,
    action,
    disabled,
    followBack,
    onToggle, // --- ADDED DESTRUCTURING ---
}: Props) {
    const [following, setFollowing] = useState(initiallyFollowing);
    const [isPending, startTransition] = useTransition();

    const label = following ? "Following" : followBack ? "Follow back" : "Follow";

    return (
        <form
            action={(formData) => {
                const next = !following; // optimistic
                
                // --- MODIFIED: Execute the callback here ---
                setFollowing(next);
                onToggle?.(next); 
                // ----------------------------------------

                startTransition(async () => {
                    formData.set("targetId", targetId);
                    const res = await action(formData);
                    
                    if (!res?.ok) {
                        setFollowing(!next); // rollback on failure
                        onToggle?.(!next); // rollback the count in the parent too
                    }
                });
            }}
        >
            <input type="hidden" name="targetId" value={targetId} />
            <button
                type="submit"
                disabled={disabled || isPending}
                className={[
                    "rounded-lg px-3 py-2 text-sm transition",
                    following
                        ? "bg-neutral-700 hover:bg-neutral-600"
                        : "bg-amber-500 hover:bg-amber-400 text-black font-medium",
                    isPending ? "opacity-70 cursor-wait" : "",
                ].join(" ")}
                aria-pressed={following}
            >
                {label}
            </button>
        </form>
    );
}