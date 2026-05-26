const BASE = "/Urlaubsplaner/";

export default function Logo({ size = 64 }: { size?: number }) {
  return (
    <img
      src={BASE + "logo.jpg"}
      alt="Tatzmania – Kinderzeichnung"
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover border-2 border-amber"
      style={{ transform: "rotate(-90deg)" }}
    />
  );
}
