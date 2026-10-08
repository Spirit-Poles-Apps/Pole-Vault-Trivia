/** Line-drawn vaulter clearing a glowing crossbar. Decorative. */
export function VaulterArt() {
  return (
    <svg className="vaulter" viewBox="0 0 290 96" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="vt-glow" x1="0" x2="1">
          <stop offset="0" stopColor="#e4007c" stopOpacity="0" />
          <stop offset=".5" stopColor="#ff4fa7" />
          <stop offset="1" stopColor="#e4007c" stopOpacity="0" />
        </linearGradient>
        <filter id="vt-blur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <rect x="40" y="52" width="3" height="44" fill="#3a3740" />
      <rect x="247" y="52" width="3" height="44" fill="#3a3740" />
      <rect x="20" y="58" width="250" height="4" fill="url(#vt-glow)" filter="url(#vt-blur)" />
      <rect x="43" y="59" width="204" height="2" fill="#ff4fa7" />
      <g fill="none" stroke="#f6f3ec" strokeLinecap="round" strokeLinejoin="round">
        <path d="M66 96 Q 84 42 112 10" strokeWidth="1.6" strokeOpacity=".35" />
        <path d="M118 48 C 132 26, 166 24, 186 42" strokeWidth="7" />
        <path d="M186 42 L 210 29 L 228 34" strokeWidth="5" />
        <path d="M122 42 L 113 22 L 112 10" strokeWidth="4" />
      </g>
      <circle cx="112" cy="52" r="7" fill="#f6f3ec" />
    </svg>
  );
}
