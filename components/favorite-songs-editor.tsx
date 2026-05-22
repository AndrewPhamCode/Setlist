'use client'

import { useActionState, useTransition } from 'react'
import { Music, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SpotifyTrack } from '@/components/spotify-track'
import { addFavoriteSong, removeFavoriteSong, type FavoriteSong, type ProfileState } from '@/lib/actions/profile'

const initialState: ProfileState = { error: null }

export function FavoriteSongsEditor({ songs }: { songs: FavoriteSong[] }) {
  const [state, formAction, pending] = useActionState(addFavoriteSong, initialState)
  const [removing, startRemove] = useTransition()

  return (
    <div className="space-y-4">
      {/* Existing songs */}
      {songs.length > 0 && (
        <div className="space-y-2">
          {songs.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <SpotifyTrack song={s.song} trackUri={s.trackUri} artist={s.artist} hue={210} compact />
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
        <form action={formAction} className="space-y-3 pt-2 border-t border-white/[0.07]">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Add a song</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fav-song" className="text-xs">Song</Label>
              <Input id="fav-song" name="song" placeholder="e.g. Karma Police" maxLength={200} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fav-artist" className="text-xs">Artist</Label>
              <Input id="fav-artist" name="artist" placeholder="e.g. Radiohead" maxLength={200} required />
            </div>
          </div>
          {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
          <Button type="submit" size="sm" variant="outline" disabled={pending} className="gap-1.5">
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
