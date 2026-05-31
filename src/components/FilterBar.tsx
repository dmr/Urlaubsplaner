import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowUpDown, Search, X } from "lucide-react";
import type { SortKey } from "@/lib/ranking";

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
  | "waterfall"
  | "badWeather";

const BASE_PRIMARY_FILTERS: { id: FilterKey; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "outdoor", label: "Outdoor" },
  { id: "indoor", label: "Indoor" },
  { id: "water", label: "Wasser" },
  { id: "hike", label: "Wandern" },
];

const CARD_FILTER: { id: FilterKey; label: string } = { id: "card", label: "Card-inkl." };

const MORE_FILTERS: { id: FilterKey; label: string }[] = [
  { id: "animals", label: "Tiere" },
  { id: "thrill", label: "Action" },
  { id: "culture", label: "Kultur" },
  { id: "nature", label: "Natur" },
  { id: "viewpoint", label: "Aussicht" },
  { id: "waterfall", label: "Wasserfall" },
  { id: "badWeather", label: "Schlechtwetter" },
];

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "empfohlen", label: "Empfohlen" },
  { id: "distanz", label: "Nähe" },
  { id: "preis", label: "Preis" },
  { id: "name", label: "A–Z" },
];

interface FilterBarProps {
  filter: FilterKey;
  maxDistance: number;
  sortKey: SortKey;
  searchQuery: string;
  showCardFilter: boolean;
  onFilterChange: (f: FilterKey) => void;
  onDistanceChange: (km: number) => void;
  onSortChange: (s: SortKey) => void;
  onSearchChange: (q: string) => void;
}

export default function FilterBar({
  filter,
  maxDistance,
  sortKey,
  searchQuery,
  showCardFilter,
  onFilterChange,
  onDistanceChange,
  onSortChange,
  onSearchChange,
}: FilterBarProps) {
  const PRIMARY_FILTERS = showCardFilter
    ? [BASE_PRIMARY_FILTERS[0], CARD_FILTER, ...BASE_PRIMARY_FILTERS.slice(1)]
    : BASE_PRIMARY_FILTERS;
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
      ? "px-3.5 py-2 bg-cream text-forest border border-cream rounded-full text-[12px] tracking-wider uppercase font-medium cursor-pointer"
      : "px-3.5 py-2 bg-transparent text-cream border border-cream/25 rounded-full text-[12px] tracking-wider uppercase font-medium cursor-pointer hover:bg-cream/10 active:bg-cream/20";

  return (
    <div className="mb-4">
      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-moss-soft pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Suche … z.B. Wasserfall, Schluchsee, Kinder"
          className="w-full bg-cream/[0.06] border border-cream/15 rounded-lg pl-9 pr-8 py-2.5 text-[13px] text-cream placeholder:text-moss-soft/50 outline-none focus:border-amber/40 focus:bg-cream/[0.08]"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-moss-soft hover:text-cream"
          >
            <X size={14} />
          </button>
        )}
      </div>

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

      <div className="flex items-center gap-4 flex-wrap">
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
            className="flex-1 max-w-[160px]"
            style={{ accentColor: "#c98a3a" }}
          />
          <span className="font-serif text-sm text-cream min-w-[42px]">
            {maxDistance} km
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <ArrowUpDown size={11} className="text-moss-soft" />
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSortChange(s.id)}
              className={`px-2 py-1 rounded text-[10px] tracking-wider uppercase transition-colors ${
                sortKey === s.id
                  ? "bg-cream/15 text-cream font-medium"
                  : "text-moss-soft hover:text-cream"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
