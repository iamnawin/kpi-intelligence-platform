export type IntegrationProvider = 'jira' | 'linear' | 'asana' | 'github'

export type ExternalTask = {
  externalId: string
  title: string
  status: string
  url: string
  dueDate?: string
  assignee?: string
}

export type IntegrationSettings = {
  jira?: { baseUrl: string; projectKey: string; email: string }
  linear?: { teamId?: string }
  asana?: { projectGid: string }
  github?: { owner: string; repo: string }
}
