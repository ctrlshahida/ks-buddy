import type { Activity } from './types'
import { KSB_CODES } from './ksb'

export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++ } else quoted = !quoted
    } else if (c === ',' && !quoted) {
      row.push(cell); cell = ''
    } else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      if (row.some(x => x.trim())) rows.push(row)
      row = []; cell = ''
    } else cell += c
  }
  if (quoted) throw Error('The CSV has an unclosed quote.')
  row.push(cell)
  if (row.some(x => x.trim())) rows.push(row)
  const headers = rows.shift()?.map(x => x.trim().toLowerCase().replace(/^﻿/, '')) ?? []
  return rows.map(values => Object.fromEntries(headers.map((h, i) => [h, values[i] || ''])))
}

type Raw = Record<string, unknown>

export function normaliseImport(records: unknown): Activity[] {
  if (!Array.isArray(records) || !records.length) throw Error('No activity rows were found.')
  if (records.length > 200) throw Error('Please import up to 200 activities at a time.')
  return (records as Raw[]).map((r, i) => {
    const pick = (...keys: string[]): unknown => {
      for (const k of keys) if (r[k] !== undefined && r[k] !== null) return r[k]
      return ''
    }
    const work = String(pick('work', 'description', 'activity', 'notes', 'text')).trim()
    if (!work) throw Error(`Row ${i + 1}: add a work, description, activity, notes or text field.`)
    const d = String(pick('date', 'activity_date')).slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(d))) throw Error(`Row ${i + 1}: date must use YYYY-MM-DD.`)
    const hours = Number(pick('hours', 'time_spent', 'learning_hours') || 0)
    if (!Number.isFinite(hours) || hours < 0 || hours > 24) throw Error(`Row ${i + 1}: hours must be between 0 and 24.`)
    const rawCodes = pick('codes', 'ksbs', 'ksb_codes')
    const codes = (Array.isArray(rawCodes) ? rawCodes.map(String) : String(rawCodes).split(/[;,|\s]+/)).filter(Boolean)
    if (codes.some(id => !KSB_CODES.includes(id))) throw Error(`Row ${i + 1}: a KSB code is outside the sample standard.`)
    const f = pick('files', 'evidence', 'attachments')
    return {
      id: crypto.randomUUID(),
      work,
      title: String(pick('title', 'name') || work.split(/[.!?]/)[0].slice(0, 75)),
      learn: String(pick('learn', 'learning', 'reflection') || 'Reflection not supplied — add learning context when reviewing this activity.'),
      date: d,
      hours,
      otj: ['true', 'yes', '1'].includes(String(pick('otj', 'off_the_job')).toLowerCase()),
      codes,
      files: Array.isArray(f) ? f.map(String) : String(f).split(/[;|]/).filter(Boolean),
      project: String(pick('project', 'category') || 'Imported activity'),
      source: 'File import',
    }
  })
}

export const IMPORT_TEMPLATE_CSV =
  'date,work,learning,hours,project,otj,codes,evidence\n2026-10-03,"Compared sales and finance reports","Learned how cut-off dates affect reporting",1.5,Reporting,true,K1;S3,report.pbix\n'
