import { supabase } from './supabase'

/**
 * Fetch all skills for the current authenticated user, including their history.
 * Returns skills in the shape used by the Dashboard component.
 */
export async function fetchSkills() {
  const { data, error } = await supabase
    .from('skills')
    .select(`
      id, name, total_xp, longest_streak, created_at,
      skill_history(date, xp)
    `)
    .order('created_at')

  if (error) throw error

  return data.map(skill => ({
    id: skill.id,
    name: skill.name,
    totalXP: skill.total_xp,
    longestStreak: skill.longest_streak,
    history: skill.skill_history,
  }))
}

/** Create a new skill for the current user. */
export async function createSkill(name) {
  const { data, error } = await supabase
    .from('skills')
    .insert({ name })
    .select('id, name, total_xp, longest_streak')
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    totalXP: data.total_xp,
    longestStreak: data.longest_streak,
    history: [],
  }
}

/** Rename an existing skill. */
export async function renameSkill(skillId, name) {
  const { error } = await supabase
    .from('skills')
    .update({ name })
    .eq('id', skillId)

  if (error) throw error
}

/** Delete a skill and all its history (cascades via FK). */
export async function deleteSkill(skillId) {
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', skillId)

  if (error) throw error
}

/**
 * Upsert a single history entry for the given date and update
 * the skill's aggregate totals.
 */
export async function upsertHistoryEntry(skillId, date, xp, totalXP, longestStreak) {
  const { error: historyError } = await supabase
    .from('skill_history')
    .upsert({ skill_id: skillId, date, xp }, { onConflict: 'skill_id,date' })

  if (historyError) throw historyError

  const { error: skillError } = await supabase
    .from('skills')
    .update({ total_xp: totalXP, longest_streak: longestStreak })
    .eq('id', skillId)

  if (skillError) throw skillError
}

/**
 * Replace all non-today history entries for a skill (used by the manual
 * historical data entry) and update the skill's aggregate totals.
 */
export async function replaceHistoricalData(skillId, historyEntries, totalXP, longestStreak, today) {
  // Delete existing non-today entries
  const { error: deleteError } = await supabase
    .from('skill_history')
    .delete()
    .eq('skill_id', skillId)
    .neq('date', today)

  if (deleteError) throw deleteError

  // Insert the new historical entries
  if (historyEntries.length > 0) {
    const rows = historyEntries.map(h => ({ skill_id: skillId, date: h.date, xp: h.xp }))
    const { error: insertError } = await supabase
      .from('skill_history')
      .upsert(rows, { onConflict: 'skill_id,date' })

    if (insertError) throw insertError
  }

  const { error: skillError } = await supabase
    .from('skills')
    .update({ total_xp: totalXP, longest_streak: longestStreak })
    .eq('id', skillId)

  if (skillError) throw skillError
}
