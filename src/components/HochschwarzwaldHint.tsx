import { CreditCard, Ticket } from "lucide-react";

export default function HochschwarzwaldHint() {
  return (
    <div className="mx-5 mb-5 px-4 py-3.5 bg-cream border-l-[3px] border-amber rounded-sm relative z-10">
      <div className="flex items-start gap-2.5">
        <CreditCard
          size={18}
          className="text-amber-deep shrink-0 mt-0.5"
        />
        <div className="font-sans text-[13px] text-ink leading-relaxed">
          <strong className="font-serif font-semibold">
            Hochschwarzwald Card —
          </strong>{" "}
          ab 2 Übernachtungen bei teilnehmenden Gastgebern kostenlos. Markiert
          die mit{" "}
          <Ticket size={12} className="inline-block align-baseline" /> sind 1×
          pro Aufenthalt gratis inklusive. Beim Vermieter nachfragen, falls noch
          nicht aktiviert.
        </div>
      </div>
    </div>
  );
}
