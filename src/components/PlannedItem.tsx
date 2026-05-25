import { Offer } from "@/lib/types";
import { ageWarning } from "@/lib/helpers";
import { MapPin, Clock, Ticket, AlertTriangle, X } from "lucide-react";

interface PlannedItemProps {
  offer: Offer;
  onRemove: () => void;
}

export default function PlannedItem({ offer, onRemove }: PlannedItemProps) {
  const warn = ageWarning(offer);
  const leftBorder = offer.cardIncluded ? "border-amber" : "border-moss";

  return (
    <div
      className={`bg-parchment p-4 rounded-sm border-l-[3px] ${leftBorder} flex justify-between gap-3 items-start`}
    >
      <div className="flex-1 min-w-0">
        <div className="font-serif text-lg font-medium text-ink leading-tight">
          {offer.name}
        </div>
        <div className="text-xs text-stone mt-1 flex flex-wrap gap-3">
          <span>
            <MapPin size={11} className="inline mr-0.5" />
            {offer.location}
          </span>
          <span>
            <Clock size={11} className="inline mr-0.5" />
            {offer.duration}
          </span>
          {offer.cardIncluded && (
            <span className="text-amber-deep font-semibold">
              <Ticket size={11} className="inline mr-0.5" />
              Card-inkl.
            </span>
          )}
        </div>
        {warn && (
          <div className="mt-2 text-[11px] text-blood flex items-start gap-1">
            <AlertTriangle size={11} className="mt-0.5 shrink-0" />
            <span>{warn}</span>
          </div>
        )}
      </div>
      <button
        onClick={onRemove}
        aria-label="Entfernen"
        className="bg-transparent border border-ink/20 text-ink w-8 h-8 rounded-sm cursor-pointer flex items-center justify-center shrink-0 hover:bg-ink/5"
      >
        <X size={14} />
      </button>
    </div>
  );
}
