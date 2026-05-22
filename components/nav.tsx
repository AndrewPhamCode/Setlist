import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { LogoutButton } from '@/components/logout-button'

export async function Nav() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-base tracking-tight">
          setlist
        </Link>
        <div className="flex items-center gap-5">
          {user ? (
            <>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Discover
              </Link>
              <Link
                href="/feed"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Following
              </Link>
              <Link
                href="/shows/new"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Log show
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
