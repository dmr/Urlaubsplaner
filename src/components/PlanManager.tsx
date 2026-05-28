import { useState, useRef } from "react";
import { Offer, RegionState, ScheduleEntry } from "@/lib/types";
import { TRIP_DAYS } from "@/data/tripDays";
import { offerById } from "@/lib/helpers";
import { encodeStateToUrl } from "@/lib/storage";
import {
  Download,
  Upload,
  X,
  ArrowRightLeft,
  Link,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

interface PlanManagerProps {
  region: RegionState;
  customOffers: Offer[];
  onApply: (region: RegionState) => void;
  onClose: () => void;
}

interface DayDiff {
  date: string;
  weekday: string;
  onlyMine: string[];
  onlyTheirs: string[];
  shared: string[];
  notesDiff: { mine: string; theirs: string } | null;
}

function computeDiff(mine: RegionState, theirs: RegionState): DayDiff[] {
  return TRIP_DAYS.map((day) => {
    const myEntries = (mine.schedule[day.date] ?? []).filter((e) => e.type === "offer").map((e) => e.offerId!);
    const theirEntries = (theirs.schedule[day.date] ?? []).filter((e) => e.type === "offer").map((e) => e.offerId!);
    const mySet = new Set(myEntries);
    const theirSet = new Set(theirEntries);

    const shared = myEntries.filter((id) => theirSet.has(id));
    const onlyMine = myEntries.filter((id) => !theirSet.has(id));
    const onlyTheirs = theirEntries.filter((id) => !mySet.has(id));

    const myNote = mine.notes[day.date] ?? "";
    const theirNote = theirs.notes[day.date] ?? "";
    const notesDiff = myNote !== theirNote ? { mine: myNote, theirs: theirNote } : null;

    return { date: day.date, weekday: day.weekday, onlyMine, onlyTheirs, shared, notesDiff };
  });
}

function mergeStates(mine: RegionState, theirs: RegionState, selections: Record<string, "mine" | "theirs" | "both">): RegionState {
  const schedule: Record<string, ScheduleEntry[]> = {};

  for (const day of TRIP_DAYS) {
    const sel = selections[day.date] ?? "both";
    const myEntries = mine.schedule[day.date] ?? [];
    const theirEntries = theirs.schedule[day.date] ?? [];

    if (sel === "mine") {
      schedule[day.date] = myEntries;
    } else if (sel === "theirs") {
      schedule[day.date] = theirEntries;
    } else {
      const seen = new Set<string>();
      const merged: ScheduleEntry[] = [];
      for (const e of myEntries) {
        const key = e.type === "offer" ? e.offerId : e.id;
        if (key && !seen.has(key)) { seen.add(key); merged.push(e); }
        else if (!key) merged.push(e);
      }
      for (const e of theirEntries) {
        const key = e.type === "offer" ? e.offerId : e.id;
        if (key && !seen.has(key)) { seen.add(key); merged.push(e); }
      }
      schedule[day.date] = merged;
    }
  }

  const notes = { ...mine.notes };
  for (const day of TRIP_DAYS) {
    const sel = selections[day.date] ?? "both";
    if (sel === "theirs" && theirs.notes[day.date]) notes[day.date] = theirs.notes[day.date];
    if (sel === "both" && theirs.notes[day.date] && !mine.notes[day.date]) notes[day.date] = theirs.notes[day.date];
  }

  const customSet = new Set(mine.customOffers.map((o) => o.id));
  const mergedCustom = [...mine.customOffers, ...theirs.customOffers.filter((o) => !customSet.has(o.id))];

  return { schedule, notes, customOffers: mergedCustom, dismissed: mine.dismissed, homeBaseName: mine.homeBaseName };
}

function offerName(id: string, customOffers: Offer[]): string {
  return offerById(id, customOffers)?.name ?? id;
}

export default function PlanManager({ region, customOffers, onApply, onClose }: PlanManagerProps) {
  const [importedState, setImportedState] = useState<RegionState | null>(null);
  const [diff, setDiff] = useState<DayDiff[] | null>(null);
  const [selections, setSelections] = useState<Record<string, "mine" | "theirs" | "both">>({});
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = JSON.stringify(region, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `urlaubsplan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      let result: RegionState | null = null;
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed && typeof parsed.schedule === "object") {
          result = {
            schedule: parsed.schedule ?? {},
            notes: parsed.notes ?? {},
            customOffers: parsed.customOffers ?? [],
            dismissed: parsed.dismissed ?? [],
            homeBaseName: parsed.homeBaseName ?? region.homeBaseName,
          };
        }
      } catch { /* invalid */ }
      if (!result) {
        setError("Ungültige Datei — konnte den Plan nicht lesen.");
        return;
      }
      setImportedState(result);
      setDiff(computeDiff(region, result));
      const initial: Record<string, "mine" | "theirs" | "both"> = {};
      TRIP_DAYS.forEach((d) => { initial[d.date] = "both"; });
      setSelections(initial);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleMerge = () => {
    if (!importedState) return;
    onApply(mergeStates(region, importedState, selections));
  };

  const handleReplaceAll = () => {
    if (!importedState) return;
    if (confirm("Aktuellen Plan komplett ersetzen?")) onApply(importedState);
  };

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const encoded = encodeStateToUrl(region);
    const url = `${window.location.origin}${window.location.pathname}?plan=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const hasDifferences = diff?.some((d) => d.onlyMine.length > 0 || d.onlyTheirs.length > 0 || d.notesDiff);

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-parchment rounded-lg w-full max-w-[600px] my-4 relative">
        <div className="sticky top-0 z-20 flex justify-end p-2 pointer-events-none">
          <button onClick={onClose} className="pointer-events-auto bg-ink/70 text-cream w-10 h-10 rounded-full flex items-center justify-center hover:bg-ink shadow-lg">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-6 -mt-6">
          <h2 className="font-serif font-medium text-[24px] text-ink mb-1">
            Plan teilen
          </h2>
          <p className="text-[13px] text-stone mb-5">
            Plan exportieren oder einen anderen Plan importieren und zusammenführen.
          </p>

          {/* Share Link */}
          <button
            onClick={handleCopyLink}
            className="w-full py-3 bg-moss text-cream rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-moss/80 mb-3"
          >
            {copied ? <><Copy size={16} /> Link kopiert!</> : <><Link size={16} /> Plan als Link kopieren</>}
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full py-3 bg-forest text-cream rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-forest-deep mb-3"
          >
            <Download size={16} /> Plan als Datei exportieren
          </button>

          {/* Import */}
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-3 bg-cream-soft border border-stone/20 text-ink rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-cream mb-1"
          >
            <Upload size={16} /> Plan-Datei importieren
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFile} className="hidden" />

          {error && <div className="text-[12px] text-rust mt-2">{error}</div>}

          {/* Diff view */}
          {diff && importedState && (
            <div className="mt-5 pt-5 border-t border-stone/20">
              {!hasDifferences ? (
                <div className="py-4 text-center text-[14px] text-stone">
                  <Check size={20} className="inline mr-2 text-moss" />
                  Pläne sind identisch — keine Unterschiede.
                </div>
              ) : (
                <>
                  <h3 className="text-[16px] font-medium text-ink mb-3 flex items-center gap-2">
                    <ArrowRightLeft size={16} /> Unterschiede
                  </h3>

                  <div className="space-y-3">
                    {diff.filter((d) => d.onlyMine.length > 0 || d.onlyTheirs.length > 0 || d.notesDiff).map((d) => {
                      const dayData = TRIP_DAYS.find((t) => t.date === d.date)!;
                      const sel = selections[d.date] ?? "both";

                      return (
                        <div key={d.date} className="border border-stone/15 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-[13px] text-ink">
                              {dayData.weekday} {new Date(d.date).getDate()}. — {dayData.full}
                            </span>
                            <div className="flex gap-1">
                              {(["mine", "both", "theirs"] as const).map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => setSelections({ ...selections, [d.date]: opt })}
                                  className={`px-2 py-1 rounded text-[10px] font-medium ${
                                    sel === opt ? "bg-moss text-cream" : "bg-stone/10 text-stone hover:bg-stone/20"
                                  }`}
                                >
                                  {opt === "mine" ? "Meins" : opt === "theirs" ? "Import" : "Beides"}
                                </button>
                              ))}
                            </div>
                          </div>

                          {d.shared.length > 0 && (
                            <div className="text-[11px] text-stone mb-1">
                              {d.shared.map((id) => offerName(id, customOffers)).join(", ")}
                            </div>
                          )}

                          {d.onlyMine.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {d.onlyMine.map((id) => (
                                <span key={id} className="text-[10px] px-2 py-0.5 rounded-full bg-moss/15 text-moss border border-moss/30">
                                  Mein: {offerName(id, customOffers)}
                                </span>
                              ))}
                            </div>
                          )}

                          {d.onlyTheirs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {d.onlyTheirs.map((id) => (
                                <span key={id} className="text-[10px] px-2 py-0.5 rounded-full bg-amber/15 text-amber-deep border border-amber/30">
                                  Import: {offerName(id, importedState.customOffers)}
                                </span>
                              ))}
                            </div>
                          )}

                          {d.notesDiff && (
                            <div className="mt-1 text-[10px] text-stone">
                              <AlertTriangle size={10} className="inline mr-1" />
                              Notiz unterschiedlich
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleMerge}
                      className="flex-1 py-3 bg-moss text-cream rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-moss/80"
                    >
                      <ArrowRightLeft size={15} /> Zusammenführen
                    </button>
                    <button
                      onClick={handleReplaceAll}
                      className="py-3 px-4 bg-rust/20 text-rust border border-rust/30 rounded-lg text-[13px] font-medium hover:bg-rust/30"
                    >
                      Ersetzen
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
