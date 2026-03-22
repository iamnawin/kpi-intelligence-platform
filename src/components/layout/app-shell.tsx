import { Sidebar } from './sidebar'

type Props = {
  children: React.ReactNode
  workspaceName?: string | null
  userEmail?: string
  displayName?: string
}

export function AppShell({ children, workspaceName, userEmail, displayName }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar
        workspaceName={workspaceName ?? null}
        userEmail={userEmail ?? ''}
        displayName={displayName ?? ''}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
