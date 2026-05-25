import { useState } from "react";
import { Offer } from "@/lib/types";
import { TRIP_DAYS } from "@/data/tripDays";
import { TAG_META } from "@/data/offers";
import { ageWarning } from "@/lib/helpers";
import {
  MapPin,
  Clock,
  Ticket,
  AlertTriangle,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface OfferCardProps {
  offer: Offer;
  activeDay: string;
  onAdd: (date: string) => void;
}

function TagChip({ tag }: { tag: keyof typeof TAG_META }) {
  const meta = TAG_META[tag];
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full border font-medium tracking-wider uppercase"
      style={{
        backgroundColor: meta.color + "22",
        color: meta.color,
        borderColor: meta.color + "55",
      }}
    >
      {meta.label}
    </span>
  );
}

export default function OfferCard({ offer, activeDay, onAdd }: OfferCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [picking, setPicking] = useState(false);
  const warn = ageWarning(offer);

  return (
    <div className="bg-parchment rounded-sm overflow-hidden flex flex-col border border-cream">
      <div className="p-4">
        <div className="flex justify-between items-start gap-2.5">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-[0.15em] uppercase text-stone/70">
              {offer.sub}
            </div>
            <h3 className="font-serif font-medium text-[22px] leading-tight text-ink mt-1 -tracking-[0.01em]">
              {offer.name}
            </h3>
          </div>
          {offer.cardIncluded && (
            <div
              title="Hochschwarzwald Card inklusive"
              className="px-2 py-0.5 bg-amber/15 text-amber-deep border border-amber/40 rounded-sm text-[10px] font-semibold flex items-center gap-1 shrink-0"
            >
              <Ticket size={10} /> CARD
            </div>
          )}
        </div>

        <div className="mt-2.5 flex gap-3 flex-wrap text-xs text-stone">
          <span>
            <MapPin size={11} className="inline mr-0.5" />
            {offer.location}
          </span>
          <span>
            <Clock size={11} className="inline mr-0.5" />
            {offer.duration}
          </span>
          <span>{offer.price}</span>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {offer.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>

        <p className="text-[13px] text-ink leading-relaxed mt-3 mb-0">
          {offer.description}
        </p>

        {warn && (
          <div className="mt-2.5 px-2.5 py-2 bg-blood/10 border border-blood/30 rounded-sm text-[11px] text-blood flex items-start gap-1.5">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            <span>{warn}</span>
          </div>
        )}

        {expanded && (
          <div className="mt-3 pt-3 border-t border-dashed border-stone/30 text-xs text-stone leading-relaxed">
            {offer.pro && (
              <div>
                <strong className="text-moss">+ </strong>
                {offer.pro}
              </div>
            )}
            {offer.con && (
              <div className="mt-1">
                <strong className="text-rust">− </strong>
                {offer.con}
              </div>
            )}
            {offer.cardDiscount && (
              <div className="mt-1 text-amber-deep">
                <Ticket size={11} className="inline mr-0.5" />
                {offer.cardDiscount}
              </div>
            )}
            {offer.url && (
              <div className="mt-1.5">
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone underline hover:text-ink"
                >
                  Offizielle Website ↗
                </a>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2.5 bg-transparent border-none text-stone text-[11px] cursor-pointer p-0 flex items-center gap-1 tracking-wider"
        >
          {expanded ? (
            <>
              Weniger <ChevronUp size={12} />
            </>
          ) : (
            <>
              Pro / Contra <ChevronDown size={12} />
            </>
          )}
        </button>
      </div>

      <div className="px-4 pb-3.5 mt-auto">
        {!picking ? (
          <button
            onClick={() => setPicking(true)}
            className="w-full py-2.5 bg-forest text-cream rounded-sm cursor-pointer text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-1.5 hover:bg-forest-deep"
          >
            <Plus size={14} /> An Tag hinzufügen
          </button>
        ) : (
          <div>
            <div className="text-[10px] tracking-wider uppercase text-stone mb-1.5">
              An welchen Tag?
            </div>
            <div className="grid grid-cols-7 gap-1">
              {TRIP_DAYS.map((d) => (
                <button
                  key={d.date}
                  onClick={() => {
                    onAdd(d.date);
                    setPicking(false);
                  }}
                  className={`py-2 rounded-sm cursor-pointer text-[11px] font-semibold text-cream ${
                    d.date === activeDay ? "bg-amber" : "bg-forest hover:bg-forest-deep"
                  }`}
                >
                  {d.weekday}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPicking(false)}
              className="mt-1.5 bg-transparent border-none text-stone text-[11px] cursor-pointer"
            >
              Abbrechen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
