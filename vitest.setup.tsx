import '@testing-library/jest-dom'

// Mock Next.js modules not available in jsdom
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  notFound: vi.fn(),
}))

// Mock server-only — not available in jsdom
vi.mock('server-only', () => ({}))
