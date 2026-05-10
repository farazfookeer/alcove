export function AlcoveLogo() {
  return (
    <div className="flex justify-center">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id="arch" x1="40" y1="0" x2="40" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M12 72 V36 Q12 8 40 8 Q68 8 68 36 V72"
          stroke="url(#arch)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
        />
        <path
          d="M24 72 V42 Q24 22 40 22 Q56 22 56 42 V72"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <line x1="8" y1="72" x2="72" y2="72" stroke="url(#arch)" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="40" cy="58" rx="12" ry="10" fill="#F59E0B" opacity="0.06" />
      </svg>
    </div>
  );
}
