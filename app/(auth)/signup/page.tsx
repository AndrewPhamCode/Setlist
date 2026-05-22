import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">setlist</h1>
        <p className="text-muted-foreground text-sm">
          Create an account to get started
        </p>
      </div>
      <AuthForm mode="signup" />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-foreground hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
