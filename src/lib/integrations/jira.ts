import type { ExternalTask } from './types'

type JiraSettings = { baseUrl: string; projectKey: string; email: string }

type JiraIssue = {
  id: string
  key: string
  self: string
  fields: {
    summary: string
    status: { name: string }
    duedate: string | null
    assignee: { displayName: string } | null
  }
}

export async function fetchJiraIssues(
  token: string,
  settings: JiraSettings
): Promise<ExternalTask[]> {
  const { baseUrl, projectKey, email } = settings
  const basicAuth = Buffer.from(`${email}:${token}`).toString('base64')

  const jql = encodeURIComponent(`project = "${projectKey}" ORDER BY updated DESC`)
  const url = `${baseUrl}/rest/api/3/search?jql=${jql}&maxResults=100&fields=summary,status,duedate,assignee`

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
      Accept: 'application/json',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`Jira API error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as { issues: JiraIssue[] }

  return data.issues.map(issue => ({
    externalId: issue.key,
    title: issue.fields.summary,
    status: issue.fields.status.name.toLowerCase(),
    url: `${baseUrl}/browse/${issue.key}`,
    dueDate: issue.fields.duedate ?? undefined,
    assignee: issue.fields.assignee?.displayName,
  }))
}
