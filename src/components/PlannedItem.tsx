import { useState } from "react";
import { Offer } from "@/lib/types";
import { ageWarning } from "@/lib/helpers";
import { MapPin, Clock, Ticket, AlertTriangle, X, Trash2, ExternalLink } from "lucide-react";

interface PlannedItemProps {
  offer: Offer;
  startTime?: string;
  endTime?: string;
  highlighted?: boolean;
  onRemove: () => void;
  onTap: () => void;
  onOpenDetail: () => void;
  onUpdateTime?: (startTime: string, endTime: string) => void;
}

export default function PlannedItem({
  offer,
  startTime,
  endTime,
  highlighted,
  onRemove,
  onTap,
  onOpenDetail,
  onUpdateTime,
}: PlannedItemProps) {
  const [confirming, setConfirming] = useState(false);
  const warn = ageWarning(offer);
  const leftBorder = offer.cardIncluded ? "border-amber" : offer.hikeDetails ? "border-moss" : "border-moss";

  return (
    <div
      onClick={onTap}
      className={`bg-parchment p-4 rounded-sm border-l-[3px] ${leftBorder} flex justify-between gap-3 items-start cursor-pointer transition-all ${
        highlighted ? "ring-2 ring-amber ring-offset-1 ring-offset-forest-deep" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        {/* Hike mini-route thumbnail */}
        {offer.hikeDetails && offer.hikeDetails.path.length > 1 && (
          <HikeThumb path={offer.hikeDetails.path} difficulty={offer.hikeDetails.difficulty} />
        )}
        <div className="font-serif text-lg font-medium text-ink leading-tight">
          {offer.hikeDetails ? "🥾 " : ""}{offer.name}
        </div>
        <div className="text-[13px] text-stone mt-1 flex flex-wrap gap-3">
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
              Card
            </span>
          )}
        </div>
        {onUpdateTime && (
          <div className="flex items-center gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
            <input type="time" value={startTime || ""} onChange={(e) => onUpdateTime(e.target.value, endTime || "")} className="bg-cream-soft border border-stone/20 rounded px-1.5 py-1 text-[11px] text-ink w-[72px]" />
            <span className="text-stone text-[11px]">–</span>
            <input type="time" value={endTime || ""} onChange={(e) => onUpdateTime(startTime || "", e.target.value)} className="bg-cream-soft border border-stone/20 rounded px-1.5 py-1 text-[11px] text-ink w-[72px]" />
          </div>
        )}
        {warn && (
          <div className="mt-2 text-[11px] text-blood flex items-start gap-1">
            <AlertTriangle size={11} className="mt-0.5 shrink-0" />
            <span>{warn}</span>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onOpenDetail(); }}
          className="mt-2 text-[11px] text-moss hover:text-cream flex items-center gap-1"
        >
          <ExternalLink size={10} /> Details anzeigen
        </button>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
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
            <button onClick={() => setConfirming(false)} className="text-[10px] text-stone hover:text-ink text-center">
              Abbrechen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HikeThumb({ path, difficulty }: { path: [number, number][]; difficulty: string }) {
  const lats = path.map((p) => p[0]);
  const lngs = path.map((p) => p[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const pad = 4;
  const w = 120, h = 32;
  const rangeLat = maxLat - minLat || 0.001;
  const rangeLng = maxLng - minLng || 0.001;
  const points = path.map(([lat, lng]) => {
    const x = pad + ((lng - minLng) / rangeLng) * (w - pad * 2);
    const y = pad + ((maxLat - lat) / rangeLat) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const color = difficulty === "leicht" ? "#6a9458" : difficulty === "mittel" ? "#d49540" : "#a03030";

  return (
    <svg width={w} height={h} className="mb-1 rounded bg-ink/5">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points.split(" ")[0].split(",")[0]} cy={points.split(" ")[0].split(",")[1]} r="2.5" fill={color} />
    </svg>
  );
}
