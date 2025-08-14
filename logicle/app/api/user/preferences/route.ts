import ApiResponses from '@/api/utils/ApiResponses'
import { requireSession } from '../../utils/auth'
import * as dto from '@/types/dto'
import { db } from '@/db/database'

export const dynamic = 'force-dynamic'

export const PUT = requireSession(async (session, req) => {
  const newPreferences = (await req.json()) as Partial<dto.UserPreferences>

  // Fetch existing preferences to merge with new ones
  const user = await db
    .selectFrom('User')
    .select('preferences')
    .where('User.id', '=', session.userId)
    .executeTakeFirst()

  // Parse existing preferences, defaulting to empty object if null/invalid
  let existingPreferences: dto.UserPreferences = {}
  if (user?.preferences) {
    try {
      existingPreferences = JSON.parse(user.preferences)
    } catch {
      // If parsing fails, start fresh
      existingPreferences = {}
    }
  }

  // Merge new preferences with existing ones (new values override)
  const mergedPreferences = {
    ...existingPreferences,
    ...newPreferences,
  }

  await db
    .updateTable('User')
    .set('preferences', JSON.stringify(mergedPreferences))
    .where('User.id', '=', session.userId)
    .execute()

  return ApiResponses.success()
})
