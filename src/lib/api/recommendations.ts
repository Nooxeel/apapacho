import { api } from './client'

/**
 * Algorithmic Transparency API — Ley 21.719 (Group 3.6).
 *
 * The backend stores a `RecommendationLog` row per (user, item) shown via the
 * discover endpoints. This client lets the UI fetch the human-readable
 * explanation for any creator/post the user is currently looking at, plus
 * toggle the profiling opt-out flag.
 */

export type RecommendationItemType = 'creator' | 'post'

export interface RecommendationExplanationFound {
  explained: true
  shownAt: string
  reason: string
  score: number | null
  algorithmVersion: string
}

export interface RecommendationExplanationMissing {
  explained: false
  message: string
}

export type RecommendationExplanation =
  | RecommendationExplanationFound
  | RecommendationExplanationMissing

/**
 * Fetch the most recent recommendation reason for a (user, item) pair. The
 * backend returns `{ explained: false, message }` if the item was not shown
 * via discover (e.g. direct profile visit).
 */
export async function getRecommendationExplanation(
  itemId: string,
  itemType: RecommendationItemType,
  token: string
): Promise<RecommendationExplanation> {
  const params = new URLSearchParams({ itemId, itemType })
  return api<RecommendationExplanation>(
    `/users/me/recommendations/explanation?${params.toString()}`,
    { token }
  )
}

/**
 * Disable algorithmic personalization. After this call:
 *  - The user's `profilingOptedOut` flag is set to true.
 *  - Their PROFILING consent is withdrawn.
 *  - The discover endpoints return chronological / non-personalized content.
 */
export async function optOutProfiling(token: string): Promise<{ ok: true; profilingOptedOut: true }> {
  return api<{ ok: true; profilingOptedOut: true }>('/users/me/profiling/opt-out', {
    method: 'POST',
    token,
  })
}

/**
 * Re-enable algorithmic personalization. Creates a new `UserConsent` row
 * (granted) and clears `profilingOptedOut`.
 */
export async function optInProfiling(token: string): Promise<{ ok: true; profilingOptedOut: false }> {
  return api<{ ok: true; profilingOptedOut: false }>('/users/me/profiling/opt-in', {
    method: 'POST',
    token,
  })
}
