'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/star-rating'
import { logShow, type ShowState } from '@/lib/actions/shows'

const initialState: ShowState = { error: null }

export function ShowForm() {
  const [state, formAction, pending] = useActionState(logShow, initialState)

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="artist">Artist</Label>
        <Input
          id="artist"
          name="artist"
          placeholder="e.g. Radiohead"
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
          maxLength={200}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          name="city"
          placeholder="e.g. New York, NY"
          maxLength={100}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="showDate">Date</Label>
        <Input id="showDate" name="showDate" type="date" required />
      </div>
      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRating name="rating" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review">
          Review{' '}
          <span className="text-muted-foreground font-normal">(optional)</span>
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
