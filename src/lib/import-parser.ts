export type ImportRow = {
  title: string
  description?: string
  status?: string
  goal_type?: string
  progress_pct?: string
  start_date?: string
  end_date?: string
}

const VALID_STATUSES = new Set(['not_started', 'in_progress', 'at_risk', 'completed', 'cancelled'])
const VALID_TYPES = new Set(['standard', 'strategic', 'operational', 'personal', 'team'])

// Minimal CSV parser that handles quoted fields containing commas/newlines
export function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const headers = splitCSVLine(lines[0]).map(h => h.trim().toLowerCase())

  const rows: ImportRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i])
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      obj[h] = values[idx]?.trim() ?? ''
    })
    if (obj['title']) {
      rows.push({
        title:       obj['title'],
        description: obj['description'] || undefined,
        status:      obj['status'] || undefined,
        goal_type:   obj['goal_type'] || obj['type'] || undefined,
        progress_pct:obj['progress_pct'] || obj['progress'] || undefined,
        start_date:  obj['start_date'] || undefined,
        end_date:    obj['end_date'] || undefined,
      })
    }
  }
  return rows
}

function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

export function parseJSON(text: string): ImportRow[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON — please check the format')
  }

  const arr = Array.isArray(parsed) ? parsed : (parsed as Record<string, unknown>)['goals']
  if (!Array.isArray(arr)) throw new Error('JSON must be an array of objects (or { goals: [...] })')

  return arr
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .filter(item => typeof item['title'] === 'string' && item['title'])
    .map(item => ({
      title:       String(item['title']),
      description: item['description'] ? String(item['description']) : undefined,
      status:      item['status'] ? String(item['status']) : undefined,
      goal_type:   item['goal_type'] ?? item['type'] ? String(item['goal_type'] ?? item['type']) : undefined,
      progress_pct:item['progress_pct'] ?? item['progress'] ? String(item['progress_pct'] ?? item['progress']) : undefined,
      start_date:  item['start_date'] ? String(item['start_date']) : undefined,
      end_date:    item['end_date'] ? String(item['end_date']) : undefined,
    }))
}

export type ValidationResult = {
  valid: ImportRow[]
  errors: string[]
}

export function validateImportRows(rows: ImportRow[]): ValidationResult {
  const valid: ImportRow[] = []
  const errors: string[] = []

  rows.forEach((row, i) => {
    const lineNum = i + 1
    if (!row.title?.trim()) {
      errors.push(`Row ${lineNum}: title is required`)
      return
    }
    if (row.status && !VALID_STATUSES.has(row.status)) {
      errors.push(`Row ${lineNum}: invalid status "${row.status}" — use: ${[...VALID_STATUSES].join(', ')}`)
    }
    if (row.goal_type && !VALID_TYPES.has(row.goal_type)) {
      errors.push(`Row ${lineNum}: invalid goal_type "${row.goal_type}" — use: ${[...VALID_TYPES].join(', ')}`)
    }
    const pct = row.progress_pct !== undefined ? Number(row.progress_pct) : NaN
    if (row.progress_pct !== undefined && (isNaN(pct) || pct < 0 || pct > 100)) {
      errors.push(`Row ${lineNum}: progress_pct must be 0–100`)
    }
    valid.push(row)
  })

  return { valid, errors }
}
