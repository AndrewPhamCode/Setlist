'use client'

import { useActionState } from 'react'
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

  return (
    <form action={formAction} className="space-y-5">
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
      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRating name="rating" defaultValue={defaults.rating} />
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
