import Link from 'next/link'
import Card from '@/components/Card'
import SignupForm from '@/components/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-4 py-10">
        <Card className="p-8 rounded-2xl border border-white/10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Create your account</h1>
          <p className="text-soft mt-2 text-sm">
            Join <span className="font-semibold">HYPED</span> and let friends hype you up.
          </p>

          <div className="mt-6">
            <SignupForm />
          </div>

          <p className="text-dim text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:no-underline">Sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}