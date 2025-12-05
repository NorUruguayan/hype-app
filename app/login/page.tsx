// app/login/page.tsx
import PageTheme from "@/components/PageTheme";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  return (
    <>
      {/* Cool-teal background, no orange */}
      <PageTheme name="teal" />

      <main className="app-container min-h-[calc(100dvh-56px)] grid place-items-center py-10">
        <section className="w-full max-w-md">
          {/* Brand (no emoji) */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight">HYPED</h1>
            <p className="opacity-80 mt-1">Get hyped by your friends</p>
          </div>

          <div className="ui-card p-5">
            <h2 className="text-center text-sm font-semibold mb-3">Sign in</h2>
            <LoginForm />
          </div>
        </section>
      </main>
    </>
  );
}