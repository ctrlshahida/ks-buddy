import type { Draft, Suggestion } from './types'

const REASONS: Record<string, string> = {
  S3: 'Your description suggests you interpreted data and investigated findings. Add the analysis itself to support this mapping.',
  K2: 'Checking discrepancies or data quality can show how you validate information before using it.',
  K1: 'Exploring how the reporting or business process works can demonstrate understanding of operational context.',
  B1: 'Working with others and discussing your approach can provide evidence of collaboration.',
  S6: 'Presenting findings may show that you can communicate information to a relevant audience.',
  K3: 'Considering personal information and data protection may demonstrate awareness of responsible data use.',
  K4: 'Using statistical ideas in context may show understanding of the principles behind your analysis.',
  S8: 'Applying a statistical method may provide evidence when you explain your approach and assumptions.',
  S1: 'Collecting, cleaning or organising information may demonstrate preparation of data for analysis.',
  B2: 'Taking ownership of a task may provide evidence of responsibility. Add the outcome and any feedback to strengthen it.',
}

/** Simulated analysis: keyword rules, no AI service is called. */
export function makeSuggestions(draft: Draft): { suggestions: Suggestion[]; draft: Draft } {
  const w = draft.work.toLowerCase()
  let ids: string[] = []
  if (/report|power bi|sales|finance|analys|data/.test(w)) ids.push('S3', 'K2')
  if (/process|business|manager|order/.test(w)) ids.push('K1')
  if (/team|colleague|spoke|meeting|collabor/.test(w)) ids.push('B1')
  if (/present|stakeholder/.test(w)) ids.unshift('S6')
  if (/privacy|protect|personal|ethic/.test(w)) ids.unshift('K3')
  if (/statistic|average|regression/.test(w)) ids.unshift('K4', 'S8')
  if (/import|collect|clean|organis/.test(w)) ids.unshift('S1')
  if (!ids.length) ids = ['B2']

  const suggestions = [...new Set(ids)].slice(0, 4).map(id => ({
    id,
    reason: REASONS[id],
    accepted: false,
    confidence: id === 'B2' ? 'Needs context' : 'Moderate confidence',
  }))

  const isReport = /power bi|report/i.test(draft.work)
  return {
    suggestions,
    draft: {
      ...draft,
      title: isReport ? 'Updated reporting and investigated findings' : draft.work.trim().split(/[.!?]/)[0].slice(0, 75),
      summary: draft.work.trim(),
      learn: /report|power bi/.test(w)
        ? 'Explored how reporting definitions and business processes affect data consistency, and practised investigating discrepancies between information sources.'
        : 'This activity suggests learning through practical work. Record what changed in your understanding, the method you used, and feedback you received.',
    },
  }
}
