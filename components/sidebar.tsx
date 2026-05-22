import Link from 'next/link'
import { Music2 } from 'lucide-react'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { buttonVariants } from '@/components/ui/button'
import { NavLinks } from '@/components/nav-links'

export async function Sidebar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let username: string | null = null
  let displayName: string | null = null
  if (user) {
    const [profile] = await db
      .select({ username: profiles.username, displayName: profiles.displayName })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)
    username = profile?.username ?? null
    displayName = profile?.displayName ?? null
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 h-screen sticky top-0 border-r border-white/[0.07] px-3 py-6 bg-background/60 backdrop-blur-xl">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-transparent to-transparent pointer-events-none rounded-r-none" />

        <div className="relative z-10 flex flex-col h-full">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 mb-7 group"
          >
            <div className="size-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/30 transition-shadow group-hover:shadow-primary/50"
              style={{ background: 'linear-gradient(135deg, oklch(0.72 0.26 290), oklch(0.60 0.28 315))' }}
            >
              <Music2 className="size-4 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">setlist</span>
          </Link>

          <NavLinks
            isLoggedIn={!!user}
            username={username}
            displayName={displayName}
          />

          {!user && (
            <div className="mt-auto pt-4 border-t border-white/[0.07] space-y-2">
              <Link href="/login" className={buttonVariants({ variant: 'ghost', className: 'w-full justify-start font-medium' })}>
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants({ className: 'w-full font-semibold' })}>
                Sign up free
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-20 border-b border-white/[0.07] bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-lg flex items-center justify-center shadow-md shadow-primary/25 transition-shadow group-hover:shadow-primary/40"
              style={{ background: 'linear-gradient(135deg, oklch(0.72 0.26 290), oklch(0.60 0.28 315))' }}
            >
              <Music2 className="size-3.5 text-white" />
            </div>
            <span className="font-black text-base tracking-tight">setlist</span>
          </Link>
          {!user && (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants({ size: 'sm', className: 'font-semibold' })}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
