import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'
import { ImportForm } from '@/components/forms/import-form'

export default function ImportAchievementsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/achievements"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Achievements
        </Link>
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-gray-500" />
          <h1 className="text-2xl font-semibold text-gray-50">Import Achievements</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Bulk import historical achievements from a CSV or JSON file. Up to 100 rows per import.
        </p>
      </div>
      <ImportForm />
    </div>
  )
}
