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

      {/* Tiger/cat body - child's sketch style, rotated 90° left so it stands upright */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Body (was horizontal, now vertical — chunky rectangle) */}
        <path
          d="M38 42 C36 38 37 32 42 30 L58 30 C63 32 64 38 62 42 L62 58 C63 62 62 66 58 68 L42 68 C38 66 37 62 38 58 Z"
          stroke="#f3ead7"
          strokeWidth="2"
          fill="none"
        />

        {/* Legs - 4 stubby legs at bottom, childlike */}
        <line x1="42" y1="68" x2="40" y2="80" stroke="#f3ead7" strokeWidth="2.5" />
        <line x1="48" y1="68" x2="47" y2="80" stroke="#f3ead7" strokeWidth="2.5" />
        <line x1="53" y1="68" x2="54" y2="80" stroke="#f3ead7" strokeWidth="2.5" />
        <line x1="58" y1="68" x2="61" y2="80" stroke="#f3ead7" strokeWidth="2.5" />

        {/* Neck going up */}
        <line x1="50" y1="30" x2="50" y2="22" stroke="#f3ead7" strokeWidth="2.5" />

        {/* Head - round, childlike */}
        <circle cx="50" cy="17" r="8" stroke="#f3ead7" strokeWidth="2" fill="none" />

        {/* Ears - two triangles poking up */}
        <line x1="44" y1="12" x2="41" y2="5" stroke="#f3ead7" strokeWidth="2" />
        <line x1="41" y1="5" x2="46" y2="10" stroke="#f3ead7" strokeWidth="1.5" />
        <line x1="56" y1="12" x2="59" y2="5" stroke="#f3ead7" strokeWidth="2" />
        <line x1="59" y1="5" x2="54" y2="10" stroke="#f3ead7" strokeWidth="1.5" />

        {/* Eyes - two dots */}
        <circle cx="46" cy="16" r="1.5" fill="#f3ead7" />
        <circle cx="54" cy="16" r="1.5" fill="#f3ead7" />

        {/* Nose */}
        <circle cx="50" cy="19" r="1" fill="#c98a3a" />

        {/* Whiskers */}
        <line x1="44" y1="19" x2="36" y2="18" stroke="#f3ead7" strokeWidth="1" />
        <line x1="44" y1="20" x2="36" y2="21" stroke="#f3ead7" strokeWidth="1" />
        <line x1="56" y1="19" x2="64" y2="18" stroke="#f3ead7" strokeWidth="1" />
        <line x1="56" y1="20" x2="64" y2="21" stroke="#f3ead7" strokeWidth="1" />

        {/* Tail - curvy, sticking out to the right */}
        <path
          d="M62 42 C68 40 72 36 70 30 C69 26 72 24 76 26"
          stroke="#f3ead7"
          strokeWidth="2"
          fill="none"
        />

        {/* Stripes on body (tiger!) */}
        <line x1="42" y1="38" x2="48" y2="38" stroke="#c98a3a" strokeWidth="1.5" />
        <line x1="52" y1="42" x2="58" y2="42" stroke="#c98a3a" strokeWidth="1.5" />
        <line x1="42" y1="48" x2="48" y2="48" stroke="#c98a3a" strokeWidth="1.5" />
        <line x1="52" y1="52" x2="58" y2="52" stroke="#c98a3a" strokeWidth="1.5" />
        <line x1="42" y1="58" x2="48" y2="58" stroke="#c98a3a" strokeWidth="1.5" />

        {/* Ball next to tiger (from the child's drawing - spotted circle) */}
        <circle cx="26" cy="60" r="10" stroke="#f3ead7" strokeWidth="2" fill="none" />
        <circle cx="23" cy="56" r="3" stroke="#c98a3a" strokeWidth="1.2" fill="none" />
        <circle cx="29" cy="63" r="2.5" stroke="#c98a3a" strokeWidth="1.2" fill="none" />
        <circle cx="24" cy="64" r="1.5" stroke="#c98a3a" strokeWidth="1" fill="none" />
      </g>

      {/* Small text arc at bottom */}
      <text
        x="50"
        y="95"
        textAnchor="middle"
        fill="#8aa57a"
        fontSize="6"
        fontFamily="DM Sans, sans-serif"
        letterSpacing="0.15em"
      >
        SCHWARZWALD
      </text>
    </svg>
  );
}
