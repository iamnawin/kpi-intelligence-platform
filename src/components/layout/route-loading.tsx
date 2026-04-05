import { Loader2 } from 'lucide-react'

type Props = {
  title: string
  message: string
}

export function RouteLoading({ title, message }: Props) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  )
}
