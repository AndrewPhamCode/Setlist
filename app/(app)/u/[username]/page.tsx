export default function UserProfilePage({
  params,
}: {
  params: { username: string }
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">@{params.username}</h1>
      <p className="text-muted-foreground text-sm mt-1">
        Profile coming in Phase 3.
      </p>
    </div>
  )
}
