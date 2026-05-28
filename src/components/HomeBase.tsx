import { useState } from "react";
import { MapPin, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { RegionId } from "@/lib/types";
import { REGION_LIST } from "@/data/regions";

interface HomeBaseProps {
  name: string;
  activeRegion: RegionId;
  onChangeName: (name: string) => void;
  onSwitchRegion: (region: RegionId) => void;
}

export default function HomeBase({ name, activeRegion, onChangeName, onSwitchRegion }: HomeBaseProps) {
  const [editing, setEditing] = useState(false);
  const [showCard, setShowCard] = useState(false);

  return (
    <div className="mx-5 mb-3 relative z-10 space-y-2">
      {/* Region tabs */}
      <div className="flex gap-1.5">
        {REGION_LIST.map((r) => (
          <button
            key={r.id}
            onClick={() => onSwitchRegion(r.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors border ${
              activeRegion === r.id
                ? "bg-moss text-cream border-moss"
                : "bg-transparent text-moss-soft border-cream/15 hover:text-cream hover:border-cream/30"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Home Base name */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-moss/15 border border-moss/30 rounded-lg">
        <MapPin size={16} className="text-moss shrink-0" />
        {!editing ? (
          <>
            <span className="text-[14px] text-cream font-medium flex-1">Unterkunft: {name}</span>
            <button onClick={() => setEditing(true)} className="text-[10px] text-moss-soft hover:text-cream">ändern</button>
          </>
        ) : (
          <input
            type="text"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
            autoFocus
            className="flex-1 bg-transparent border-b border-cream/30 text-[14px] text-cream outline-none py-0.5"
          />
        )}
      </div>

      {/* Hochschwarzwald Card (only for Löffingen) */}
      {activeRegion === "loeffingen" && (
        <>
          <button onClick={() => setShowCard(!showCard)} className="w-full flex items-center gap-2 px-4 py-2 bg-amber/10 border border-amber/20 rounded-lg text-left">
            <CreditCard size={14} className="text-amber shrink-0" />
            <span className="text-[12px] text-amber font-medium flex-1">Hochschwarzwald Card</span>
            {showCard ? <ChevronUp size={12} className="text-amber/60" /> : <ChevronDown size={12} className="text-amber/60" />}
          </button>
          {showCard && (
            <div className="px-4 py-2.5 bg-amber/5 border border-amber/15 rounded-lg text-[12px] text-cream/80 leading-relaxed">
              Ab 2 Übernachtungen bei teilnehmenden Gastgebern kostenlos. Angebote mit 🎫 sind 1× pro Aufenthalt gratis inklusive.
            </div>
          )}
        </>
      )}
    </div>
  );
}
