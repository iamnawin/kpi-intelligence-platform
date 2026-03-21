type Props = {
  pct: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({ pct, size = 48, strokeWidth = 4, className }: Props) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-gray-200 dark:stroke-gray-700"
      />
      {/* Fill */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="stroke-blue-500 transition-all duration-300"
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
      {/* Label */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.24}
        className="fill-gray-700 font-semibold dark:fill-gray-200"
      >
        {pct}%
      </text>
    </svg>
  )
}
