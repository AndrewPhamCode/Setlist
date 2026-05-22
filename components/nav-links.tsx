'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Compass,
  Rss,
  Search,
  PlusCircle,
  Settings,
  CalendarDays,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/actions/auth'

type NavLinksProps = {
  isLoggedIn: boolean
  username: string | null
  displayName: string | null
}

export function NavLinks({ isLoggedIn, username, displayName }: NavLinksProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const loggedInLinks = [
    { href: '/', icon: Compass, label: 'Discover' },
    { href: '/feed', icon: Rss, label: 'Following' },
    { href: '/for-you', icon: Sparkles, label: 'For You' },
    { href: '/events', icon: CalendarDays, label: 'Events' },
    { href: '/search', icon: Search, label: 'Search' },
    ...(username ? [{ href: `/u/${username}`, icon: User, label: 'Profile' }] : []),
    ...(username ? [{ href: '/settings', icon: Settings, label: 'Settings' }] : []),
  ]

  const guestLinks = [
    { href: '/', icon: Compass, label: 'Discover' },
    { href: '/search', icon: Search, label: 'Search' },
  ]

  const links = isLoggedIn ? loggedInLinks : guestLinks

  return (
    <>
      {/* Log show CTA (logged in only) */}
      {isLoggedIn && (
        <Link
          href="/shows/new"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold mb-3 transition-all',
            isActive('/shows/new')
              ? 'opacity-90 shadow-md'
              : 'hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'
          )}
          style={{
            background: 'linear-gradient(135deg, oklch(0.72 0.26 290), oklch(0.60 0.28 315))',
            color: 'white',
          }}
        >
          <PlusCircle className="size-[18px] shrink-0" />
          Log show
        </Link>
      )}

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive(href)
                ? 'bg-white/[0.08] text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
            )}
          >
            <Icon
              className={cn(
                'size-[18px] shrink-0 transition-colors',
                isActive(href) ? 'text-primary' : ''
              )}
            />
            {label}
          </Link>
        ))}
      </nav>

      {/* Desktop bottom: user info + logout */}
      {isLoggedIn && username && (
        <div className="mt-auto pt-4 border-t border-white/[0.07] space-y-0.5">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold truncate">{displayName ?? username}</p>
            <p className="text-xs text-muted-foreground">@{username}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all cursor-pointer"
          >
            <LogOut className="size-[18px] shrink-0" />
            Log out
          </button>
        </div>
      )}

      {/* Mobile bottom nav */}
      {isLoggedIn && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl border-t border-white/[0.07]"
          style={{ background: 'oklch(0.08 0.012 285 / 0.95)' }}
        >
          <div className="flex items-center justify-around px-2 h-16 max-w-screen-sm mx-auto">
            {[
              { href: '/', icon: Compass },
              { href: '/feed', icon: Rss },
              { href: '/for-you', icon: Sparkles },
              { href: '/events', icon: CalendarDays },
              { href: '/shows/new', icon: PlusCircle },
              ...(username ? [{ href: `/u/${username}`, icon: User }] : []),
              { href: '/search', icon: Search },
            ].map(({ href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl transition-all',
                  isActive(href) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('size-5', isActive(href) && 'drop-shadow-sm')} />
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  )
}
