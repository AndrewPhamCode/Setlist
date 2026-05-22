'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile, type ProfileState } from '@/lib/actions/profile'

const initialState: ProfileState = { error: null }

export function EditProfileForm({
  defaultDisplayName,
  defaultBio,
}: {
  defaultDisplayName: string | null
  defaultBio: string | null
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={defaultDisplayName ?? ''}
          maxLength={50}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">
          Bio <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={defaultBio ?? ''}
          placeholder="Tell people about your taste in live music"
          maxLength={160}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">160 characters max</p>
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
