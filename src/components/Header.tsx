import { Users, Baby, MapPin } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="relative px-5 pt-8 pb-5 z-10">
      <div className="flex items-start gap-4">
        <Logo size={72} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] tracking-[0.25em] uppercase text-moss-soft mb-1.5">
            Schwarzwald · Pfingsten 2026
          </div>

          <h1
            className="font-serif font-light italic text-cream m-0 leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(32px, 8vw, 56px)" }}
          >
            Eine Woche
            <br />
            <span className="not-italic font-light">um Löffingen</span>
          </h1>

          <div className="mt-3 flex gap-4 flex-wrap text-sm text-cream-soft">
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} /> 4 Erwachsene
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Baby size={14} /> Kinder 7 · 6 · 3
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} /> 1. – 7. Juni
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
