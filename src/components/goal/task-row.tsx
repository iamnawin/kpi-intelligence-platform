import { Circle, Clock, AlertCircle, CheckCircle2, XCircle, User, Calendar } from "lucide-react"
import type { TaskRecord, TaskStatus } from "@/lib/goal-data"

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  todo:        <Circle       className="h-4 w-4 text-gray-300" />,
  in_progress: <Clock        className="h-4 w-4 text-blue-400" />,
  blocked:     <AlertCircle  className="h-4 w-4 text-red-400" />,
  done:        <CheckCircle2 className="h-4 w-4 text-green-400" />,
  cancelled:   <XCircle      className="h-4 w-4 text-gray-300" />,
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo:        'To do',
  in_progress: 'In progress',
  blocked:     'Blocked',
  done:        'Done',
  cancelled:   'Cancelled',
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TaskRow({ task }: { task: TaskRecord }) {
  const isDone = task.status === 'done'
  const dueDate = formatDate(task.due_date)

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="mt-0.5 shrink-0" aria-label={STATUS_LABEL[task.status]}>
        {STATUS_ICON[task.status]}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-sm ${isDone ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
          {task.title}
        </p>

        {(task.assignee_name || dueDate) && (
          <div className="mt-0.5 flex items-center gap-x-3 text-xs text-gray-400 dark:text-gray-500">
            {task.assignee_name && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden="true" />
                {task.assignee_name}
              </span>
            )}
            {dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                {dueDate}
              </span>
            )}
          </div>
        )}
      </div>

      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
        task.status === 'done'        ? 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' :
        task.status === 'in_progress' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' :
        task.status === 'blocked'     ? 'bg-red-50 text-red-500 dark:bg-red-950 dark:text-red-400' :
        task.status === 'cancelled'   ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500' :
                                        'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
      }`}>
        {STATUS_LABEL[task.status]}
      </span>
    </div>
  )
}
