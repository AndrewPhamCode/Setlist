'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { completeOnboarding, type ProfileState } from '@/lib/actions/profile'

const initialState: ProfileState = { error: null }

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialState
  )

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          placeholder="yourname"
          minLength={3}
          maxLength={30}
          required
        />
        <p className="text-xs text-muted-foreground">
          3–30 characters · letters, numbers, underscores only
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          placeholder="Your Name"
          maxLength={50}
          required
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : 'Get started'}
      </Button>
    </form>
  )
}
