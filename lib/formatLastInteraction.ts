export function formatLastInteraction(timestamp: string | null | undefined): string | null {
  if (!timestamp) return null

  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then

  if (diffMs < 0) return null

  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${Math.max(1, diffMins)} mins ago`
  }

  if (diffHours < 48) {
    return `${diffHours} hours ago`
  }

  return `${diffDays} days ago`
}
