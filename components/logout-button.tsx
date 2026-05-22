'use client'

import { signOut } from '@/lib/actions/auth'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      Log out
    </button>
  )
}
