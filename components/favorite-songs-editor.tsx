'use client'

import { useActionState, useTransition, useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpotifyTrack } from '@/components/spotify-track'
import { SpotifyTrackSearch } from '@/components/spotify-track-search'
import { addFavoriteSong, removeFavoriteSong, type FavoriteSong, type ProfileState } from '@/lib/actions/profile'
import type { SpotifyTrackResult } from '@/lib/spotify'

const initialState: ProfileState = { error: null }

export function FavoriteSongsEditor({ songs }: { songs: FavoriteSong[] }) {
  const [state, formAction, pending] = useActionState(addFavoriteSong, initialState)
  const [removing, startRemove] = useTransition()
  const [selected, setSelected] = useState<SpotifyTrackResult | null>(null)

  return (
    <div className="space-y-4">
      {/* Existing songs */}
      {songs.length > 0 && (
        <div className="space-y-2">
          {songs.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <SpotifyTrack song={s.song} trackUri={s.trackUri} artist={s.artist} albumArt={s.albumArt} hue={210} />
              </div>
              <button
                type="button"
                disabled={removing}
                onClick={() => startRemove(() => removeFavoriteSong(i))}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {songs.length === 0 && (
        <p className="text-sm text-muted-foreground">No favorite songs yet.</p>
      )}

      {/* Add form */}
      {songs.length < 6 && (
        <form
          action={formAction}
          onSubmit={() => setSelected(null)}
          className="space-y-3 pt-2 border-t border-white/[0.07]"
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Add a song</p>

          {/* Hidden inputs populated by search */}
          <input type="hidden" name="song" value={selected?.name ?? ''} />
          <input type="hidden" name="artist" value={selected?.artist ?? ''} />
          <input type="hidden" name="trackUri" value={selected?.trackUri ?? ''} />
          <input type="hidden" name="albumArt" value={selected?.albumArt ?? ''} />

          <SpotifyTrackSearch
            selected={selected}
            onSelect={setSelected}
            onClear={() => setSelected(null)}
          />

          {state?.error && <p className="text-xs text-destructive">{state.error}</p>}

          <Button type="submit" size="sm" variant="outline" disabled={pending || !selected} className="gap-1.5">
            <Plus className="size-3.5" />
            {pending ? 'Adding…' : 'Add song'}
          </Button>
        </form>
      )}

      {songs.length >= 6 && (
        <p className="text-xs text-muted-foreground">Maximum 6 songs reached.</p>
      )}
    </div>
  )
}
