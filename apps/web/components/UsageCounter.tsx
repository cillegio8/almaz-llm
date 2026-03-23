interface UsageCounterProps {
  used: number
  max: number
}

export default function UsageCounter({ used, max }: UsageCounterProps) {
  const percentage = (used / max) * 100
  const remaining = max - used
  const isLow = remaining <= 3

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex flex-col items-end">
        <span className={`text-xs font-medium ${isLow ? 'text-amber-500' : 'text-silver'}`}>
          {used} / {max} sual
        </span>
        <div className="w-20 h-1.5 bg-midnight-lighter rounded-full overflow-hidden mt-0.5">
          <div
            className={`h-full rounded-full transition-all ${
              isLow ? 'bg-amber-500' : 'bg-gold'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className={`text-xs sm:hidden ${isLow ? 'text-amber-500' : 'text-silver'}`}>
        {used}/{max}
      </span>
    </div>
  )
}
