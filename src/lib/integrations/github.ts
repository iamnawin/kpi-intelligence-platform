import type { ExternalTask } from './types'

type GitHubSettings = { owner: string; repo: string }

type GitHubIssue = {
  number: number
  title: string
  state: 'open' | 'closed'
  html_url: string
  due_on?: string
  assignee: { login: string } | null
}

export async function fetchGitHubIssues(
  token: string,
  settings: GitHubSettings
): Promise<ExternalTask[]> {
  const { owner, repo } = settings
  const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100&sort=updated`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as GitHubIssue[]

  return data
    .filter(issue => !('pull_request' in issue))
    .map(issue => ({
      externalId: `${owner}/${repo}#${issue.number}`,
      title: issue.title,
      status: issue.state === 'closed' ? 'completed' : 'in_progress',
      url: issue.html_url,
      assignee: issue.assignee?.login,
    }))
}
