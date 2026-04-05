'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { parseCSV, parseJSON, validateImportRows } from '@/lib/import-parser'
import { importGoals } from '@/app/actions/import-actions'
import type { ImportRow } from '@/lib/import-parser'
import { proofPathRoutes } from '@/lib/proofpath-routes'

type Step = 1 | 2 | 3

const EXAMPLE_CSV = `title,description,status,goal_type,progress_pct
Grow MRR to $300k,Increase revenue through upsell,in_progress,strategic,40
Reduce churn below 2%,,not_started,operational,0
Launch mobile app,iOS and Android,in_progress,team,60`

export function ImportForm() {
  const [step, setStep] = useState<Step>(1)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [parseError, setParseError] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleParse(text: string, type: 'csv' | 'json') {
    setParseError('')
    try {
      const parsed = type === 'csv' ? parseCSV(text) : parseJSON(text)
      const { valid, errors } = validateImportRows(parsed)
      setRows(valid)
      setValidationErrors(errors)
      setStep(2)
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Parse failed')
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      handleParse(text, file.name.endsWith('.json') ? 'json' : 'csv')
    }
    reader.readAsText(file)
  }

  function handlePasteSubmit() {
    const text = textareaRef.current?.value ?? ''
    if (!text.trim()) return
    const looksJSON = text.trim().startsWith('[') || text.trim().startsWith('{')
    handleParse(text, looksJSON ? 'json' : 'csv')
  }

  async function handleImport() {
    setImporting(true)
    try {
      const res = await importGoals(rows)
      setResult(res)
      setStep(3)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(['Upload', 'Preview', 'Done'] as const).map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
              step === i + 1
                ? 'bg-blue-600 text-white'
                : step > i + 1
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {step > i + 1 ? '✓' : i + 1}
            </span>
            <span className={step === i + 1 ? 'font-medium text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-500'}>
              {label}
            </span>
            {i < 2 && <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          {/* File drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-10 transition-colors hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-950/20"
          >
            <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload .csv or .json</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">or paste data below</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 dark:text-gray-500"><span className="bg-white px-2 dark:bg-gray-950">or paste data</span></div>
          </div>

          {/* Paste area */}
          <div className="flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              rows={6}
              placeholder={EXAMPLE_CSV}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-600"
            />
            <button
              type="button"
              onClick={handlePasteSubmit}
              className="self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Parse &amp; Preview
            </button>
          </div>

          {parseError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {parseError}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-gray-50">{rows.length}</strong> row{rows.length !== 1 ? 's' : ''} ready to import
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              ← Back
            </button>
          </div>

          {validationErrors.length > 0 && (
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950">
              <p className="mb-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400">Warnings (rows still included):</p>
              <ul className="flex flex-col gap-0.5">
                {validationErrors.map((e, i) => (
                  <li key={i} className="text-xs text-yellow-600 dark:text-yellow-400">{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  {['Title', 'Status', 'Type', 'Progress', 'Start', 'End'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {rows.slice(0, 20).map((row, i) => (
                  <tr key={i}>
                    <td className="max-w-[200px] truncate px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{row.title}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{row.status || '—'}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{row.goal_type || '—'}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{row.progress_pct ?? '—'}%</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{row.start_date || '—'}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{row.end_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && (
              <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">+ {rows.length - 20} more rows (max 100 will be imported)</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || rows.length === 0}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? 'Importing…' : `Import ${Math.min(rows.length, 100)} Achievement${rows.length !== 1 ? 's' : ''}`}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 3 && result && (
        <div className="flex flex-col gap-4">
          <div className={`flex items-start gap-3 rounded-xl p-5 ${
            result.inserted > 0
              ? 'bg-green-50 dark:bg-green-950'
              : 'bg-red-50 dark:bg-red-950'
          }`}>
            {result.inserted > 0
              ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500 dark:text-green-400" />
              : <AlertCircle className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />
            }
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                {result.inserted > 0
                  ? `${result.inserted} achievement${result.inserted !== 1 ? 's' : ''} imported successfully`
                  : 'Import failed'}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-xs text-red-600 dark:text-red-400">{e}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={proofPathRoutes.achievements}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              View Achievements
            </a>
            <button
              type="button"
              onClick={() => { setStep(1); setRows([]); setResult(null) }}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Import More
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
