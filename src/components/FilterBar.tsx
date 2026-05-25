export type FilterKey =
  | "all"
  | "card"
  | "outdoor"
  | "indoor"
  | "water"
  | "animals"
  | "hike"
  | "thrill"
  | "badWeather";

const FILTERS: { id: FilterKey; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "card", label: "Card-inkl." },
  { id: "outdoor", label: "Outdoor" },
  { id: "indoor", label: "Indoor" },
  { id: "water", label: "Wasser" },
  { id: "animals", label: "Tiere" },
  { id: "hike", label: "Wandern" },
  { id: "thrill", label: "Action" },
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
  return (
    <div className="mb-4">
      <div className="flex gap-1.5 flex-wrap mb-3">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const cls = active
            ? "px-3 py-1.5 bg-cream text-forest border border-cream rounded-full text-[11px] tracking-wider uppercase font-medium cursor-pointer"
            : "px-3 py-1.5 bg-transparent text-cream border border-cream/25 rounded-full text-[11px] tracking-wider uppercase font-medium cursor-pointer hover:bg-cream/10";
          return (
            <button key={f.id} onClick={() => onFilterChange(f.id)} className={cls}>
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5">
        <span className="text-[10px] tracking-wider uppercase text-moss-soft">
          Max. Fahrt
        </span>
        <input
          type="range"
          min={0}
          max={60}
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
