// FILE: app/landing/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'HYPE — Get Hyped By Your Friends',
  description: 'Create your hype page. Collect testimonials. Share anywhere.',
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[color:var(--brand-dark)]">
      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Hero */}
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Get Hyped By Your Friends
          </h1>
          <p className="mt-4 text-lg md:text-2xl text-white/80">
            Create your hype page. Collect testimonials. Share anywhere.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              href="/signup"
              className="brand-gradient text-white px-6 py-3 rounded-full font-semibold shadow-brand hover:opacity-90"
            >
              Get Your Hype Page
            </Link>
            <Link
              href="/demo"
              className="px-6 py-3 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              See Demo
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Go to Daily Hype Feed
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16 bg-white/[0.05] border border-white/10 rounded-3xl p-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">1️⃣</div>
              <h3 className="font-semibold text-xl mb-1">Create Your Page</h3>
              <p className="text-white/80">
                Sign up and get your unique hype URL
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">2️⃣</div>
              <h3 className="font-semibold text-xl mb-1">Hype Up & Hype Me</h3>
              <p className="text-white/80">
                Friends can hype you; you can request hype
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">3️⃣</div>
              <h3 className="font-semibold text-xl mb-1">Share Anywhere</h3>
              <p className="text-white/80">
                Drop it on socials, resumes, profiles
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}