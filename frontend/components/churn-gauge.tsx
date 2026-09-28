"use client";

interface ChurnGaugeProps {
  probability: number;
}

export function ChurnGauge({ probability }: ChurnGaugeProps) {
  const percentage = Math.max(0, Math.min(100, probability * 100));

  // Needle position: 0% = left, 50% = top, 100% = right.
  const angle = 180 - percentage * 1.8;
  const radians = (angle * Math.PI) / 180;

  const centerX = 110;
  const centerY = 112;
  const needleLength = 68;

  const needleX = centerX + needleLength * Math.cos(radians);
  const needleY = centerY - needleLength * Math.sin(radians);

  // Build a slim, tapered needle blade (wide at the hub, knife-thin at the tip)
  // instead of a single stroked line, so it reads as a real instrument needle.
  const perpAngle = radians + Math.PI / 2;
  const hubHalfWidth = 3.2;
  const hubInset = 9; // pulls the wide end in from dead-center, under the pivot cap
  const hubX = centerX - hubInset * Math.cos(radians);
  const hubY = centerY + hubInset * Math.sin(radians);

  const bladeBaseLeftX = hubX + hubHalfWidth * Math.cos(perpAngle);
  const bladeBaseLeftY = hubY - hubHalfWidth * Math.sin(perpAngle);
  const bladeBaseRightX = hubX - hubHalfWidth * Math.cos(perpAngle);
  const bladeBaseRightY = hubY + hubHalfWidth * Math.sin(perpAngle);

  const needlePoints = `${bladeBaseLeftX},${bladeBaseLeftY} ${needleX},${needleY} ${bladeBaseRightX},${bladeBaseRightY}`;

  // A short tail on the opposite side of the pivot for visual balance.
  const tailLength = 14;
  const tailX = centerX - tailLength * Math.cos(radians);
  const tailY = centerY + tailLength * Math.sin(radians);

  return (
    <div className="flex w-full max-w-[280px] flex-col items-center">
      <svg
        viewBox="0 0 220 150"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`Churn probability ${percentage.toFixed(1)} percent`}
      >
        <defs>
          {/* Gradient meter — colors/offsets preserved exactly */}
          <linearGradient
            id="churnGaugeGradient"
            x1="20"
            y1="110"
            x2="200"
            y2="110"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          {/* Soft ambient glow sitting behind the arc */}
          <filter id="churnGaugeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Needle shadow, softened */}
          <filter id="churnGaugeNeedleShadow" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodOpacity="0.28" />
          </filter>

          {/* Subtle metal gradient for the needle blade */}
          <linearGradient id="churnGaugeNeedleFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Radial sheen for the pivot cap */}
          <radialGradient id="churnGaugePivotSheen" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>
        </defs>

        {/* Track — translucent, no hard outer border */}
        <path
          d="M 22 110 A 88 88 0 0 1 198 110"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          className="text-slate-200/60 dark:text-slate-700/50"
        />

        {/* Gradient meter with soft glow — gradient itself unchanged */}
        <path
          d="M 22 110 A 88 88 0 0 1 198 110"
          fill="none"
          stroke="url(#churnGaugeGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.92"
          filter="url(#churnGaugeGlow)"
        />

        {/* Tick marks, refined to hairlines */}
        {Array.from({ length: 11 }).map((_, index) => {
          const tickAngle = 180 - index * 18;
          const tickRadians = (tickAngle * Math.PI) / 180;
          const isMajor = index % 5 === 0;

          const outerRadius = 98;
          const innerRadius = isMajor ? 90 : 93.5;

          const x1 = centerX + outerRadius * Math.cos(tickRadians);
          const y1 = centerY - outerRadius * Math.sin(tickRadians);
          const x2 = centerX + innerRadius * Math.cos(tickRadians);
          const y2 = centerY - innerRadius * Math.sin(tickRadians);

          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={isMajor ? 1.4 : 1}
              strokeLinecap="round"
              className="text-slate-300 dark:text-slate-600"
              opacity={isMajor ? 0.9 : 0.55}
            />
          );
        })}

        {/* Needle tail (counterweight) */}
        <line
          x1={centerX}
          y1={centerY}
          x2={tailX}
          y2={tailY}
          stroke="url(#churnGaugeNeedleFill)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Needle blade — tapered polygon, not a flat stroked line */}
        <polygon
          points={needlePoints}
          fill="url(#churnGaugeNeedleFill)"
          filter="url(#churnGaugeNeedleShadow)"
        />

        {/* Hairline highlight along the blade's top edge */}
        <line
          x1={bladeBaseLeftX}
          y1={bladeBaseLeftY}
          x2={needleX}
          y2={needleY}
          stroke="#ffffff"
          strokeWidth="0.6"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Pivot housing */}
        <circle cx={centerX} cy={centerY} r="9" fill="url(#churnGaugePivotSheen)" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r="9" fill="none" stroke="#0f172a" strokeOpacity="0.08" strokeWidth="1" />

        {/* Pivot center */}
        <circle cx={centerX} cy={centerY} r="3" fill="#6366f1" />
        <circle cx={centerX - 0.8} cy={centerY - 0.8} r="1" fill="#ffffff" opacity="0.7" />

        {/* Scale labels */}
        <text x="18" y="132" className="fill-slate-400 text-[9px] font-medium dark:fill-slate-500">
          0%
        </text>
        <text x="202" y="132" textAnchor="end" className="fill-slate-400 text-[9px] font-medium dark:fill-slate-500">
          100%
        </text>
      </svg>

      {/* Probability display — sits below the gauge, no overlap at any percentage */}
      <div className="mt-2 flex flex-col items-center">
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
          {percentage.toFixed(1)}%
        </span>
        <span className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-slate-400 dark:text-slate-500">
          Churn probability
        </span>
      </div>
    </div>
  );
}
