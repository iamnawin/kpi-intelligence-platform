import { CheckCircle2 } from 'lucide-react'

const FEATURES = [
  { title: 'Track KPIs with live data', desc: 'Connect real metrics, not spreadsheets' },
  { title: 'Set OKR-style goals', desc: 'Objectives with typed Key Results' },
  { title: 'Build an evidence trail', desc: '6-level trust system from draft to proof' },
  { title: 'Prove impact to stakeholders', desc: 'Share verifiable outcomes, not guesses' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen bg-gray-950">

        {/* ── Left: brand hero (hidden on mobile) ── */}
        <div className="relative hidden lg:flex lg:w-[58%] flex-col justify-between overflow-hidden bg-gray-950 p-12 border-r border-gray-800/60">

          {/* Ambient gradient orbs */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-2xl" />

          {/* Logo */}
          <div className="relative flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
              <span className="text-base font-bold text-white">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ProofPath</span>
          </div>

          {/* Value prop */}
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-medium text-blue-400">Performance Intelligence Platform</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white">
              Every decision<br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                backed by proof.
              </span>
            </h1>
            <p className="mb-8 max-w-md text-base leading-relaxed text-gray-400">
              Stop guessing. Track what matters, set goals your team can prove,
              and build an evidence trail from first metric to locked outcome.
            </p>

            <div className="flex flex-col gap-3">
              {FEATURES.map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">{f.title}</span>
                    <span className="text-gray-400"> — {f.desc}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="relative">
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 backdrop-blur-sm">
              <div className="mb-2 flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="h-3.5 w-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm italic text-gray-300">
                &ldquo;ProofPath transformed how we communicate impact to stakeholders. Every goal now has a verifiable evidence chain.&rdquo;
              </p>
              <p className="mt-2 text-xs text-gray-500">— Head of Product, Series B SaaS</p>
            </div>
          </div>
        </div>

        {/* ── Right: form panel ── */}
        <div className="flex flex-1 flex-col items-center justify-center bg-gray-950 px-6 py-12">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="text-lg font-bold text-white">ProofPath</span>
          </div>

          <div className="w-full max-w-[380px]">
            {children}
          </div>
        </div>

      </body>
    </html>
  )
}
