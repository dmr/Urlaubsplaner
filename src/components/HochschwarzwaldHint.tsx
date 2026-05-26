import { useState } from "react";
import { CreditCard, Ticket, ChevronDown, ChevronUp } from "lucide-react";

export default function HochschwarzwaldHint() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-5 mb-4 relative z-10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 bg-cream border-l-[3px] border-amber rounded-sm flex items-center gap-2.5 text-left"
      >
        <CreditCard size={16} className="text-amber-deep shrink-0" />
        <span className="font-serif font-semibold text-[13px] text-ink flex-1">
          Hochschwarzwald Card
        </span>
        {open ? <ChevronUp size={14} className="text-stone" /> : <ChevronDown size={14} className="text-stone" />}
      </button>
      {open && (
        <div className="px-4 py-3 bg-cream border-l-[3px] border-amber border-t-0 rounded-b-sm text-[13px] text-ink leading-relaxed">
          Ab 2 Übernachtungen bei teilnehmenden Gastgebern kostenlos. Angebote mit{" "}
          <Ticket size={12} className="inline-block align-baseline text-amber-deep" /> sind 1× pro
          Aufenthalt gratis inklusive. Beim Vermieter nachfragen, falls noch nicht aktiviert.
        </div>
      )}
    </div>
  );
}
