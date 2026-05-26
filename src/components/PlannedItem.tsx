import { useState } from "react";
import { Offer } from "@/lib/types";
import { ageWarning } from "@/lib/helpers";
import { MapPin, Clock, Ticket, AlertTriangle, X, Trash2 } from "lucide-react";

interface PlannedItemProps {
  offer: Offer;
  startTime?: string;
  endTime?: string;
  onRemove: () => void;
  onUpdateTime?: (startTime: string, endTime: string) => void;
}

export default function PlannedItem({
  offer,
  startTime,
  endTime,
  onRemove,
  onUpdateTime,
}: PlannedItemProps) {
  const [confirming, setConfirming] = useState(false);
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
        <div className="text-xs text-ink/70 mt-1 flex flex-wrap gap-3">
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
        {onUpdateTime && (
          <div className="flex items-center gap-1.5 mt-2">
            <input
              type="time"
              value={startTime || ""}
              onChange={(e) => onUpdateTime(e.target.value, endTime || "")}
              className="bg-cream-soft border border-stone/20 rounded px-1.5 py-1 text-[11px] text-ink w-[72px]"
            />
            <span className="text-stone text-[11px]">–</span>
            <input
              type="time"
              value={endTime || ""}
              onChange={(e) => onUpdateTime(startTime || "", e.target.value)}
              className="bg-cream-soft border border-stone/20 rounded px-1.5 py-1 text-[11px] text-ink w-[72px]"
            />
          </div>
        )}
        {warn && (
          <div className="mt-2 text-[11px] text-blood flex items-start gap-1">
            <AlertTriangle size={11} className="mt-0.5 shrink-0" />
            <span>{warn}</span>
          </div>
        )}
      </div>
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          aria-label="Entfernen"
          className="bg-transparent border border-ink/20 text-ink w-10 h-10 rounded-sm cursor-pointer flex items-center justify-center shrink-0 hover:bg-ink/5 active:bg-ink/10"
        >
          <X size={16} />
        </button>
      ) : (
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={() => { setConfirming(false); onRemove(); }}
            className="bg-rust/15 border border-rust/40 text-rust px-2.5 py-1.5 rounded-sm text-[10px] font-medium flex items-center gap-1 hover:bg-rust/25"
          >
            <Trash2 size={11} /> Entfernen
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-[10px] text-stone hover:text-ink text-center"
          >
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}
