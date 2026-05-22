'use client'

import { useState, useRef, useActionState } from 'react'
import { Camera, X, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/star-rating'
import { editShow, type ShowState } from '@/lib/actions/shows'

const initialState: ShowState = { error: null }

type DefaultValues = {
  artist: string
  venue: string
  city: string
  showDate: string
  rating: number
  review: string | null
  highlightSong?: string | null
  imageUrl?: string | null
}

export function EditShowForm({
  showId,
  defaults,
}: {
  showId: string
  defaults: DefaultValues
}) {
  const boundAction = editShow.bind(null, showId)
  const [state, formAction, pending] = useActionState(boundAction, initialState)
  const [preview, setPreview] = useState<string | null>(defaults.imageUrl ?? null)
  const [imageCleared, setImageCleared] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
      setImageCleared(false)
    }
  }

  const clearImage = () => {
    setPreview(null)
    setImageCleared(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden: preserve existing image URL unless cleared or replaced */}
      {!imageCleared && defaults.imageUrl && (
        <input type="hidden" name="existingImageUrl" value={defaults.imageUrl} />
      )}

      {/* Photo upload */}
      <div className="space-y-2">
        <Label>
          Photo{' '}
          <span className="text-muted-foreground font-normal">(optional)</span>
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
          defaultValue={defaults.artist}
          maxLength={200}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="venue">Venue</Label>
        <Input
          id="venue"
          name="venue"
          defaultValue={defaults.venue}
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
            defaultValue={defaults.city}
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
            defaultValue={defaults.showDate}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRating name="rating" defaultValue={defaults.rating} />
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
          defaultValue={defaults.highlightSong ?? ''}
          placeholder="e.g. Karma Police"
          maxLength={200}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review">
          Review{' '}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="review"
          name="review"
          defaultValue={defaults.review ?? ''}
          maxLength={500}
          rows={4}
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
