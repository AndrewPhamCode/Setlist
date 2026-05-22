import Link from 'next/link'
import { Music2, Compass, Rss, PlusCircle, Search, Settings } from 'lucide-react'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { buttonVariants } from '@/components/ui/button'
import { LogoutButton } from '@/components/logout-button'

export async function Nav() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let username: string | null = null
  if (user) {
    const [profile] = await db
      .select({ username: profiles.username })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)
    username = profile?.username ?? null
  }

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base tracking-tight shrink-0"
        >
          <Music2 className="size-5 text-primary" />
          <span>setlist</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          {user ? (
            <>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
              >
                <Compass className="size-4" />
                <span className="hidden sm:inline">Discover</span>
              </Link>
              <Link
                href="/feed"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
              >
                <Rss className="size-4" />
                <span className="hidden sm:inline">Following</span>
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
              >
                <Search className="size-4" />
                <span className="hidden sm:inline">Search</span>
              </Link>
              <Link
                href="/shows/new"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
              >
                <PlusCircle className="size-4" />
                <span className="hidden sm:inline">Log show</span>
              </Link>
              {username && (
                <Link
                  href="/settings"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
                >
                  <Settings className="size-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/search"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
              >
                <Search className="size-4" />
                <span className="hidden sm:inline">Search</span>
              </Link>
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
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
