import type { SupabaseClient } from '@supabase/supabase-js'
import type { Activity } from './types'

type Row = {
  id: string
  date: string
  title: string
  work: string
  learn: string
  hours: number | string
  otj: boolean
  project: string
  codes: string[]
  files: string[]
  mapping_reasons: { code: string; reason: string }[]
  source: string | null
}

const fromRow = (r: Row): Activity => ({
  id: r.id,
  date: r.date,
  title: r.title,
  work: r.work,
  learn: r.learn,
  hours: Number(r.hours),
  otj: r.otj,
  project: r.project,
  codes: r.codes,
  files: r.files,
  mappingReasons: r.mapping_reasons,
  source: r.source ?? undefined,
})

const toRow = (a: Activity) => ({
  id: a.id,
  date: a.date,
  title: a.title,
  work: a.work,
  learn: a.learn,
  hours: a.hours,
  otj: a.otj,
  project: a.project,
  codes: a.codes,
  files: a.files,
  mapping_reasons: a.mappingReasons ?? [],
  source: a.source ?? null,
})

export async function fetchRecords(supabase: SupabaseClient): Promise<Activity[]> {
  const { data, error } = await supabase.from('records').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data as Row[]).map(fromRow)
}

export async function insertRecord(supabase: SupabaseClient, activity: Activity) {
  const { error } = await supabase.from('records').insert(toRow(activity))
  if (error) throw error
}
