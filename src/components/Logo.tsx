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
      <circle cx="50" cy="50" r="48" fill="#162820" stroke="#c98a3a" strokeWidth="2" />

      {/* Child's drawing, rotated 90° CCW so the tiger stands upright */}
      <g transform="rotate(-90, 50, 50)" strokeLinecap="round" strokeLinejoin="round">

        {/* Body — wobbly trapezoid, exactly like the drawing */}
        <path
          d="M28 35 L28 52 C29 53 30 54 32 54 L55 54 C57 54 58 53 58 51 L58 32 C58 30 56 29 54 29 L32 30 C30 30 28 32 28 35 Z"
          stroke="#f3ead7"
          strokeWidth="2.2"
          fill="none"
        />

        {/* Legs — 6 wobbly sticks going up from the body, just like the kid drew */}
        <path d="M32 29 L30 18 L31 17" stroke="#f3ead7" strokeWidth="2" fill="none" />
        <path d="M37 29 L36 16" stroke="#f3ead7" strokeWidth="2" fill="none" />
        <path d="M42 29 L41 17 L42 16" stroke="#f3ead7" strokeWidth="2" fill="none" />
        <path d="M47 29 L46 18" stroke="#f3ead7" strokeWidth="2" fill="none" />
        <path d="M51 29 L51 17 L52 16" stroke="#f3ead7" strokeWidth="2" fill="none" />
        <path d="M55 30 L56 19" stroke="#f3ead7" strokeWidth="2" fill="none" />

        {/* Little bump/loop on the back — the oval on top of body */}
        <ellipse cx="45" cy="29" rx="4" ry="3" stroke="#f3ead7" strokeWidth="1.5" fill="none" />

        {/* Neck — two long wobbly lines from right side of body going right-down to head */}
        <path
          d="M58 40 L66 46 L72 54 L76 60"
          stroke="#f3ead7"
          strokeWidth="2.2"
          fill="none"
        />
        <path
          d="M58 48 L64 52 L70 58 L76 62"
          stroke="#f3ead7"
          strokeWidth="2"
          fill="none"
        />

        {/* Head — angular, with pointy ears, like the kid drew it */}
        <path
          d="M76 58 L84 56 L86 60 L84 66 L78 68 L74 65 L76 58"
          stroke="#f3ead7"
          strokeWidth="2.2"
          fill="none"
        />

        {/* Ears — two pointy triangles sticking up from head */}
        <path d="M80 56 L78 50 L82 54" stroke="#f3ead7" strokeWidth="1.8" fill="none" />
        <path d="M84 55 L85 49 L87 54" stroke="#f3ead7" strokeWidth="1.8" fill="none" />

        {/* Eyes — two bold dots, like the drawing */}
        <circle cx="80" cy="60" r="1.8" fill="#f3ead7" />
        <circle cx="84" cy="61" r="1.5" fill="#f3ead7" />

        {/* Mouth/teeth — angular open jaw to the right with little teeth */}
        <path d="M85 64 L90 63 L91 65" stroke="#f3ead7" strokeWidth="1.5" fill="none" />
        <path d="M85 66 L90 67 L91 65" stroke="#f3ead7" strokeWidth="1.5" fill="none" />

        {/* Dino Egg — large wobbly circle below/beside the head, with spots inside */}
        <path
          d="M68 68 C65 64 63 68 62 72 C61 76 62 82 66 84 C70 86 76 85 78 82 C80 78 80 72 77 68 C75 66 71 65 68 68 Z"
          stroke="#f3ead7"
          strokeWidth="2.2"
          fill="none"
        />
        {/* Spots on the dino egg — irregular circles like the kid drew */}
        <path
          d="M66 72 C64 71 64 74 66 75 C68 76 69 73 67 72"
          stroke="#f3ead7"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M72 76 C70 75 69 78 71 80 C73 81 75 79 74 77 C73 76 72 76 72 76"
          stroke="#f3ead7"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M67 79 C66 78 65 80 67 81 C68 81 68 79 67 79"
          stroke="#f3ead7"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M74 71 C73 70 72 72 73 73 C74 74 75 72 74 71"
          stroke="#f3ead7"
          strokeWidth="1.3"
          fill="none"
        />
      </g>
    </svg>
  );
}
