"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";

export async function createDailyHype(formData: FormData): Promise<void> {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/daily");

  const text = (formData.get("text") as string | null)?.trim() ?? "";
  if (!text) {
    redirect("/daily?error=empty");
  }

  const { error } = await supabase.from("daily_hypes").insert({
    user_id: user.id,
    text,
  });

  if (error) {
    // 23505 = unique violation (i.e., already posted today)
    if (error.code === "23505") {
      redirect("/daily?error=duplicate");
    }
    // Generic error: bounce back with message
    const msg = encodeURIComponent(error.message);
    redirect(`/daily?error=${msg}`);
  }

  revalidatePath("/feed");
  redirect("/feed");
}