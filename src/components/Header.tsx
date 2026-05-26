import { Users, Baby, MapPin } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="relative px-5 pt-6 pb-4 z-10">
      <div className="flex items-center gap-3">
        <Logo size={56} />
        <div className="flex-1 min-w-0">
          <h1
            className="font-serif font-light italic text-cream m-0 leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(28px, 7vw, 48px)" }}
          >
            Eine Woche
            <span className="not-italic font-light"> um Löffingen</span>
          </h1>
          <div className="mt-1.5 flex gap-3 flex-wrap text-[12px] text-cream-soft">
            <span className="inline-flex items-center gap-1">
              <Users size={12} /> 4+3
            </span>
            <span className="inline-flex items-center gap-1">
              <Baby size={12} /> 7 · 6 · 3
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> 25.–31. Mai
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
