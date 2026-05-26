export default function Logo({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="#162820" stroke="#c98a3a" strokeWidth="2" />

      {/* Mountains - childlike wobbly lines */}
      <path
        d="M10 72 L28 38 L38 55 L50 30 L62 55 L72 40 L90 72"
        stroke="#5a7f4b"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Mountain fill */}
      <path
        d="M10 72 L28 38 L38 55 L50 30 L62 55 L72 40 L90 72 Z"
        fill="#5a7f4b"
        opacity="0.15"
      />

      {/* Sun */}
      <circle cx="76" cy="22" r="8" fill="#c98a3a" opacity="0.8" />
      <line x1="76" y1="10" x2="76" y2="13" stroke="#c98a3a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="88" y1="22" x2="85" y2="22" stroke="#c98a3a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="84" y1="14" x2="82" y2="16" stroke="#c98a3a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="68" y1="14" x2="70" y2="16" stroke="#c98a3a" strokeWidth="1.5" strokeLinecap="round" />

      {/* Trees - simple childlike style */}
      <line x1="20" y1="72" x2="20" y2="60" stroke="#8aa57a" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 65 L20 52 L26 65" stroke="#8aa57a" strokeWidth="2" strokeLinecap="round" fill="#5a7f4b" fillOpacity="0.3" />

      <line x1="82" y1="72" x2="82" y2="58" stroke="#8aa57a" strokeWidth="2" strokeLinecap="round" />
      <path d="M76 63 L82 50 L88 63" stroke="#8aa57a" strokeWidth="2" strokeLinecap="round" fill="#5a7f4b" fillOpacity="0.3" />

      {/* Animal (childlike stick-figure giraffe/deer like in the drawing) */}
      <g transform="translate(38, 55)">
        {/* Body */}
        <ellipse cx="0" cy="0" rx="6" ry="3.5" stroke="#f3ead7" strokeWidth="1.5" fill="none" />
        {/* Legs */}
        <line x1="-4" y1="3" x2="-5" y2="10" stroke="#f3ead7" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-1" y1="3" x2="-1" y2="10" stroke="#f3ead7" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="3" x2="2" y2="10" stroke="#f3ead7" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="3" x2="6" y2="10" stroke="#f3ead7" strokeWidth="1.5" strokeLinecap="round" />
        {/* Neck + Head */}
        <line x1="5" y1="-2" x2="9" y2="-9" stroke="#f3ead7" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="-11" r="3" stroke="#f3ead7" strokeWidth="1.5" fill="none" />
        {/* Ears */}
        <line x1="9" y1="-14" x2="8" y2="-17" stroke="#f3ead7" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="-14" x2="13" y2="-17" stroke="#f3ead7" strokeWidth="1.2" strokeLinecap="round" />
        {/* Eye */}
        <circle cx="11" cy="-11.5" r="0.8" fill="#f3ead7" />
      </g>

      {/* Water waves at bottom */}
      <path
        d="M15 80 Q25 76 35 80 Q45 84 55 80 Q65 76 75 80 Q85 84 90 80"
        stroke="#3a6e8a"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M12 85 Q22 81 32 85 Q42 89 52 85 Q62 81 72 85 Q82 89 88 85"
        stroke="#3a6e8a"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* Ball (like in the drawing) */}
      <circle cx="60" cy="62" r="4" stroke="#c98a3a" strokeWidth="1.5" fill="none" />
      <path d="M57 59 Q60 62 63 59" stroke="#c98a3a" strokeWidth="1" fill="none" />
      <path d="M57 65 Q60 62 63 65" stroke="#c98a3a" strokeWidth="1" fill="none" />
    </svg>
  );
}
