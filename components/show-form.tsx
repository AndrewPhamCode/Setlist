'use client'

import { useState, useRef, useActionState } from 'react'
import { Camera, X, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/star-rating'
import { ShowSearch } from '@/components/show-search'
import { logShow, type ShowState } from '@/lib/actions/shows'

const initialState: ShowState = { error: null }

type Defaults = {
  artist?: string
  venue?: string
  city?: string
  date?: string
}

export function ShowForm({ defaults }: { defaults?: Defaults }) {
  const [state, formAction, pending] = useActionState(logShow, initialState)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [artist, setArtist] = useState(defaults?.artist ?? '')
  const [venue, setVenue] = useState(defaults?.venue ?? '')
  const [city, setCity] = useState(defaults?.city ?? '')
  const [date, setDate] = useState(defaults?.date ?? '')
  const [selectedLabel, setSelectedLabel] = useState<string | null>(
    defaults?.artist ? `${defaults.artist}${defaults.venue ? ` at ${defaults.venue}` : ''}` : null
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Show search */}
      <div className="space-y-2">
        <Label>Find a show</Label>
        <ShowSearch
          selected={selectedLabel}
          onSelect={(event) => {
            // Extract artist from event name (Ticketmaster uses "Artist Name" as event name)
            setArtist(event.name)
            setVenue(event.venue)
            setCity(event.city)
            setDate(event.date)
            setSelectedLabel(`${event.name}${event.venue ? ` at ${event.venue}` : ''}`)
          }}
          onClear={() => {
            setArtist('')
            setVenue('')
            setCity('')
            setDate('')
            setSelectedLabel(null)
          }}
        />
        <p className="text-xs text-muted-foreground">
          Search Ticketmaster to auto-fill the details, or fill them in below.
        </p>
      </div>

      {/* Photo upload */}
      <div className="space-y-2">
        <Label>
          Photo <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        {preview ? (
          <div className="relative rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-52 object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-background transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-accent/20 transition-all group">
            <Camera className="size-7 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Click to add a photo
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP</span>
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
          </label>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="artist">Artist</Label>
        <Input
          id="artist"
          name="artist"
          placeholder="e.g. Radiohead"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          maxLength={200}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="venue">Venue</Label>
        <Input
          id="venue"
          name="venue"
          placeholder="e.g. Madison Square Garden"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          maxLength={200}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            placeholder="e.g. New York, NY"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="showDate">Date</Label>
          <Input
            id="showDate"
            name="showDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRating name="rating" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="highlightSong" className="flex items-center gap-1.5">
          <Music className="size-3.5 text-primary" />
          Song of the night{' '}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="highlightSong"
          name="highlightSong"
          placeholder="e.g. Karma Police"
          maxLength={200}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review">
          Review <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="review"
          name="review"
          placeholder="What made this show memorable?"
          maxLength={500}
          rows={4}
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Logging…' : 'Log show'}
      </Button>
    </form>
  )
}
