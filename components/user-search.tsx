'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { getInitials } from '@/lib/utils'

type Profile = {
  id: string
  username: string | null
  displayName: string | null
}

type UserSearchProps = {
  defaultQuery?: string
}

export function UserSearch({ defaultQuery = '' }: UserSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery)
  const [suggestions, setSuggestions] = useState<Profile[]>([])
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length === 0) {
      setSuggestions([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        const data: Profile[] = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0 && focused)
      } catch {
        // ignore
      }
    }, 280)
  }, [query, focused])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setOpen(false)
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setFocused(true)
              if (suggestions.length > 0) setOpen(true)
            }}
            onBlur={() => setFocused(false)}
            placeholder="Search people or artists…"
            className="pl-9 pr-4"
            autoComplete="off"
            autoFocus
          />
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border border-white/[0.1] bg-card shadow-2xl overflow-hidden">
          {suggestions.map((p) => (
            <Link
              key={p.id}
              href={`/u/${p.username}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQuery(p.displayName ?? p.username ?? '')
                setOpen(false)
              }}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] transition-colors"
            >
              <Avatar size="sm">
                <AvatarFallback className="text-xs">
                  {getInitials(p.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {p.displayName ?? p.username}
                </p>
                <p className="text-xs text-muted-foreground">@{p.username}</p>
              </div>
              <User className="size-3.5 text-muted-foreground shrink-0 ml-auto" />
            </Link>
          ))}
          {query.trim() && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen(false)
                router.push(`/search?q=${encodeURIComponent(query.trim())}`)
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/[0.06] transition-colors border-t border-white/[0.07]"
            >
              <Search className="size-3.5 shrink-0" />
              See all results for &ldquo;{query}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
