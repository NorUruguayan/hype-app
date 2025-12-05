// app/daily/page.tsx
import StreakGrid from "@/components/StreakGrid.client";
import WeeklyGoal from "@/components/WeeklyGoal.client";
import DailyHypeComposer from "@/components/DailyHypeComposer";
import { createDailyHype } from "@/app/actions/daily";
import { getServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageTheme from "@/components/PageTheme";
import { IconSparkles } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DailyPage() {
  // Require auth
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  /**
   * Bridge a server action into the client composer.
   * IMPORTANT: this returns void so it satisfies the composer's `action` prop.
   * Your action inserts and redirects to /feed?toast=streak
   */
  async function postDaily(formData: FormData): Promise<void> {
    "use server";
    await createDailyHype(formData);
  }

  return (
    <>
      <PageTheme name="peach" />
      <div className="app-container py-8 space-y-6">
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-2xl font-bold inline-flex items-center gap-2">
            <span
              className="inline-grid place-items-center h-7 w-7 rounded-lg text-black"
              style={{ background: "linear-gradient(135deg,var(--brand-1),var(--brand-2))" }}
              aria-hidden
            >
              <IconSparkles width={16} height={16} />
            </span>
            Post your Daily Hype
          </h1>
          <div className="text-xs opacity-60">
            Pro tip: press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> to post
          </div>
        </div>

        {/* Motivation helpers */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* These components render their own card shells */}
          <StreakGrid />
          <WeeklyGoal />
        </div>

        {/* Composer */}
        <DailyHypeComposer action={postDaily} />
      </div>
    </>
  );
}