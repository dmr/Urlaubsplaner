import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type FilterKey =
  | "all"
  | "card"
  | "outdoor"
  | "indoor"
  | "water"
  | "animals"
  | "hike"
  | "thrill"
  | "culture"
  | "nature"
  | "viewpoint"
  | "badWeather";

const PRIMARY_FILTERS: { id: FilterKey; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "card", label: "Card-inkl." },
  { id: "outdoor", label: "Outdoor" },
  { id: "indoor", label: "Indoor" },
  { id: "water", label: "Wasser" },
  { id: "hike", label: "Wandern" },
];

const MORE_FILTERS: { id: FilterKey; label: string }[] = [
  { id: "animals", label: "Tiere" },
  { id: "thrill", label: "Action" },
  { id: "culture", label: "Kultur" },
  { id: "nature", label: "Natur" },
  { id: "viewpoint", label: "Aussicht" },
  { id: "badWeather", label: "Schlechtwetter" },
];

interface FilterBarProps {
  filter: FilterKey;
  maxDistance: number;
  onFilterChange: (f: FilterKey) => void;
  onDistanceChange: (km: number) => void;
}

export default function FilterBar({
  filter,
  maxDistance,
  onFilterChange,
  onDistanceChange,
}: FilterBarProps) {
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMore) return;
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMore]);

  const activeMore = MORE_FILTERS.find((f) => f.id === filter);

  const btnCls = (active: boolean) =>
    active
      ? "px-3 py-1.5 bg-cream text-forest border border-cream rounded-full text-[11px] tracking-wider uppercase font-medium cursor-pointer"
      : "px-3 py-1.5 bg-transparent text-cream border border-cream/25 rounded-full text-[11px] tracking-wider uppercase font-medium cursor-pointer hover:bg-cream/10";

  return (
    <div className="mb-4">
      <div className="flex gap-1.5 flex-wrap mb-3">
        {PRIMARY_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={btnCls(filter === f.id)}
          >
            {f.label}
          </button>
        ))}

        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setShowMore(!showMore)}
            className={btnCls(!!activeMore)}
          >
            {activeMore ? activeMore.label : "Mehr"}{" "}
            <ChevronDown size={11} className="inline" />
          </button>
          {showMore && (
            <div className="absolute left-0 top-full mt-1 z-20 bg-forest border border-moss/30 rounded-lg shadow-xl p-1.5 min-w-[140px]">
              {MORE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    onFilterChange(f.id);
                    setShowMore(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-[12px] transition-colors ${
                    filter === f.id
                      ? "bg-cream/15 text-cream font-medium"
                      : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="text-[10px] tracking-wider uppercase text-moss-soft">
          Max. Fahrt
        </span>
        <input
          type="range"
          min={0}
          max={80}
          value={maxDistance}
          onChange={(e) => onDistanceChange(Number(e.target.value))}
          className="flex-1 max-w-[200px]"
          style={{ accentColor: "#c98a3a" }}
        />
        <span className="font-serif text-sm text-cream min-w-[50px]">
          {maxDistance} km
        </span>
      </div>
    </div>
  );
}
