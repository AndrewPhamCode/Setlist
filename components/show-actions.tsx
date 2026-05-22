'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteShow } from '@/lib/actions/shows'

export function ShowActions({ showId }: { showId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Delete this show? This cannot be undone.')) return
    startTransition(() => deleteShow(showId))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded cursor-pointer"
        disabled={isPending}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push(`/shows/${showId}/edit`)}
        >
          <Pencil className="size-3.5 mr-2" />
          Edit show
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5 mr-2" />
          Delete show
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
