import type { ExternalTask } from './types'

type LinearSettings = { teamId?: string }

const LINEAR_GQL = 'https://api.linear.app/graphql'

const ISSUES_QUERY = `
  query Issues($teamId: String) {
    issues(
      filter: { team: { id: { eq: $teamId } } }
      first: 100
      orderBy: updatedAt
    ) {
      nodes {
        identifier
        title
        state { name }
        dueDate
        assignee { displayName }
        url
      }
    }
  }
`

type LinearIssue = {
  identifier: string
  title: string
  state: { name: string }
  dueDate: string | null
  assignee: { displayName: string } | null
  url: string
}

export async function fetchLinearIssues(
  token: string,
  settings: LinearSettings
): Promise<ExternalTask[]> {
  const res = await fetch(LINEAR_GQL, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: ISSUES_QUERY,
      variables: { teamId: settings.teamId ?? null },
    }),
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`Linear API error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as {
    data: { issues: { nodes: LinearIssue[] } }
  }

  return data.data.issues.nodes.map(issue => ({
    externalId: issue.identifier,
    title: issue.title,
    status: issue.state.name.toLowerCase(),
    url: issue.url,
    dueDate: issue.dueDate ?? undefined,
    assignee: issue.assignee?.displayName,
  }))
}
