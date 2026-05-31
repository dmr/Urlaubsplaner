import { useEffect, useState } from "react";
import { RegionId } from "@/lib/types";
import { REGION_LIST, REGIONS } from "@/data/regions";
import { isValidDateRange } from "@/lib/dateUtils";
import { MapPin, Calendar, Check, X } from "lucide-react";

interface RegionSetupModalProps {
  initialRegion: RegionId;
  initialStartDate?: string;
  initialEndDate?: string;
  initialHomeBaseName: string;
  isFirstSetup: boolean;
  onApply: (regionId: RegionId, startDate: string, endDate: string, homeBaseName: string) => void;
  onClose?: () => void;
}

export default function RegionSetupModal({
  initialRegion,
  initialStartDate,
  initialEndDate,
  initialHomeBaseName,
  isFirstSetup,
  onApply,
  onClose,
}: RegionSetupModalProps) {
  const [regionId, setRegionId] = useState<RegionId>(initialRegion);
  const [startDate, setStartDate] = useState<string>(initialStartDate ?? "");
  const [endDate, setEndDate] = useState<string>(initialEndDate ?? "");
  const [homeBaseName, setHomeBaseName] = useState<string>(initialHomeBaseName);
  const [touched, setTouched] = useState(false);

  // When user switches region, pre-fill home base name with the region default (if user hasn't customized it)
  useEffect(() => {
    if (!touched) {
      setHomeBaseName(REGIONS[regionId].homeBase.name);
    }
  }, [regionId, touched]);

  const valid = isValidDateRange(startDate, endDate) && homeBaseName.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    onApply(regionId, startDate, endDate, homeBaseName.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-parchment rounded-xl w-full max-w-[460px] p-5 sm:p-6 relative shadow-2xl">
        {!isFirstSetup && onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-ink/70 text-cream w-9 h-9 rounded-full flex items-center justify-center hover:bg-ink"
            aria-label="Schließen"
          >
            <X size={16} />
          </button>
        )}

        <h2 className="font-serif font-medium text-[24px] text-ink mb-1 -tracking-[0.01em]">
          {isFirstSetup ? "Willkommen!" : "Reise anpassen"}
        </h2>
        <p className="text-[13px] text-stone mb-5 leading-relaxed">
          {isFirstSetup
            ? "Wo geht's hin und wann seid ihr unterwegs? Dann kuratieren wir die passenden Ausflüge."
            : "Region, Zeitraum oder Unterkunft ändern."}
        </p>

        {/* Region */}
        <div className="mb-4">
          <label className="text-[10px] tracking-[0.18em] uppercase text-stone flex items-center gap-1.5 mb-2">
            <MapPin size={11} /> Region
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {REGION_LIST.map((r) => (
              <button
                key={r.id}
                onClick={() => setRegionId(r.id)}
                className={`px-3 py-2 rounded-lg text-[12px] font-medium border text-left transition-colors ${
                  regionId === r.id
                    ? "bg-moss text-cream border-moss"
                    : "bg-cream-soft text-ink border-stone/20 hover:border-stone/40"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="mb-4">
          <label className="text-[10px] tracking-[0.18em] uppercase text-stone flex items-center gap-1.5 mb-2">
            <Calendar size={11} /> Zeitraum
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
              className="flex-1 bg-cream-soft border border-stone/20 rounded-md px-3 py-2 text-[13px] text-ink outline-none focus:border-moss/50"
            />
            <span className="text-stone text-[12px]">bis</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              className="flex-1 bg-cream-soft border border-stone/20 rounded-md px-3 py-2 text-[13px] text-ink outline-none focus:border-moss/50"
            />
          </div>
          {startDate && endDate && !isValidDateRange(startDate, endDate) && (
            <div className="mt-1.5 text-[11px] text-rust">
              Ungültiger Zeitraum (max. 60 Tage, Ende nach Start).
            </div>
          )}
        </div>

        {/* Home base */}
        <div className="mb-5">
          <label className="text-[10px] tracking-[0.18em] uppercase text-stone mb-2 block">
            Unterkunft / Standort-Name
          </label>
          <input
            type="text"
            value={homeBaseName}
            onChange={(e) => {
              setTouched(true);
              setHomeBaseName(e.target.value);
            }}
            placeholder={REGIONS[regionId].homeBase.name}
            className="w-full bg-cream-soft border border-stone/20 rounded-md px-3 py-2 text-[13px] text-ink outline-none focus:border-moss/50"
          />
        </div>

        <button
          onClick={submit}
          disabled={!valid}
          className={`w-full py-3 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition-colors ${
            valid
              ? "bg-moss text-cream hover:bg-moss/80"
              : "bg-stone/20 text-stone cursor-not-allowed"
          }`}
        >
          <Check size={15} /> {isFirstSetup ? "Los geht's" : "Speichern"}
        </button>
      </div>
    </div>
  );
}
