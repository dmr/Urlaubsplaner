export default function TopoBackground() {
  return (
    <svg
      aria-hidden
      className="fixed inset-0 w-full h-full opacity-[0.06] pointer-events-none z-0"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="topo"
          x="0"
          y="0"
          width="200"
          height="200"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0,100 Q50,60 100,100 T200,100"
            fill="none"
            stroke="#f3ead7"
            strokeWidth="0.6"
          />
          <path
            d="M0,130 Q50,90 100,130 T200,130"
            fill="none"
            stroke="#f3ead7"
            strokeWidth="0.6"
          />
          <path
            d="M0,160 Q50,120 100,160 T200,160"
            fill="none"
            stroke="#f3ead7"
            strokeWidth="0.6"
          />
          <path
            d="M0,70 Q50,30 100,70 T200,70"
            fill="none"
            stroke="#f3ead7"
            strokeWidth="0.6"
          />
          <path
            d="M0,40 Q50,0 100,40 T200,40"
            fill="none"
            stroke="#f3ead7"
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#topo)" />
    </svg>
  );
}
