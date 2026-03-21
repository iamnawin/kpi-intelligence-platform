import type { ExternalTask } from './types'

type AsanaSettings = { projectGid: string }

type AsanaTask = {
  gid: string
  name: string
  completed: boolean
  due_on: string | null
  assignee: { name: string } | null
  permalink_url: string
}

export async function fetchAsanaTasks(
  token: string,
  settings: AsanaSettings
): Promise<ExternalTask[]> {
  const { projectGid } = settings
  const fields = 'gid,name,completed,due_on,assignee.name,permalink_url'
  const url = `https://app.asana.com/api/1.0/projects/${projectGid}/tasks?opt_fields=${fields}&limit=100`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`Asana API error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as { data: AsanaTask[] }

  return data.data.map(task => ({
    externalId: task.gid,
    title: task.name,
    status: task.completed ? 'completed' : 'in_progress',
    url: task.permalink_url,
    dueDate: task.due_on ?? undefined,
    assignee: task.assignee?.name,
  }))
}
