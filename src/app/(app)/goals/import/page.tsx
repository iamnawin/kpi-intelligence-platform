import { Upload } from 'lucide-react'
import { ImportForm } from '@/components/forms/import-form'

export default function ImportGoalsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Import Goals</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Bulk import goals from a CSV or JSON file. Up to 100 rows per import.
        </p>
      </div>
      <ImportForm />
    </div>
  )
}
