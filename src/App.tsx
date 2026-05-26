import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, DEFAULT_STATE, BreakType, Offer } from "@/lib/types";
import { loadState, saveState, clearState, exportState, importState } from "@/lib/storage";
import { offerById, getPlannedOfferIds } from "@/lib/helpers";
import { sortOffers, SortKey } from "@/lib/ranking";
import { OFFERS } from "@/data/offers";
import { TRIP_DAYS } from "@/data/tripDays";
import TopoBackground from "@/components/TopoBackground";
import Header from "@/components/Header";
import HochschwarzwaldHint from "@/components/HochschwarzwaldHint";
import DayStrip from "@/components/DayStrip";
import DayDetail from "@/components/DayDetail";
import WeekOverview from "@/components/WeekOverview";
import FilterBar, { FilterKey } from "@/components/FilterBar";
import OfferCard from "@/components/OfferCard";
import OfferModal from "@/components/OfferModal";
import MapView from "@/components/MapView";
import Footer from "@/components/Footer";
import { Loader2, Save, Check, List, Map, Calendar, Download, Upload } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved";
type ViewMode = "list" | "map";

let entryCounter = 0;
function nextEntryId(): string {
  return `entry-${Date.now()}-${++entryCounter}`;
}

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeDate, setActiveDate] = useState<string>(TRIP_DAYS[0].date);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [maxDistance, setMaxDistance] = useState<number>(80);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showWeek, setShowWeek] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("empfohlen");
  const [hidePlanned, setHidePlanned] = useState(false);
  const [hideDismissed, setHideDismissed] = useState(true);
  const [modalOffer, setModalOffer] = useState<Offer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    if (!state) return;
    setSaveStatus("saving");
    const t = setTimeout(() => {
      const ok = saveState(state);
      setSaveStatus(ok ? "saved" : "idle");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }, 400);
    return () => clearTimeout(t);
  }, [state]);

  const addToDay = useCallback((offerId: string, date: string) => {
    setState((s) => {
      if (!s) return s;
      const entries = s.schedule[date] ?? [];
      if (entries.some((e) => e.type === "offer" && e.offerId === offerId)) return s;
      return {
        ...s,
        schedule: {
          ...s.schedule,
          [date]: [...entries, { id: nextEntryId(), type: "offer" as const, offerId }],
        },
      };
    });
  }, []);

  const addHikeToDay = useCallback((hikeId: string, date: string) => {
    setState((s) => {
      if (!s) return s;
      const entries = s.schedule[date] ?? [];
      if (entries.some((e) => e.type === "hike" && e.hikeId === hikeId)) return s;
      return {
        ...s,
        schedule: {
          ...s.schedule,
          [date]: [...entries, { id: nextEntryId(), type: "hike" as const, hikeId }],
        },
      };
    });
  }, []);

  const removeFromDay = useCallback((offerId: string, date: string) => {
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        schedule: {
          ...s.schedule,
          [date]: (s.schedule[date] ?? []).filter(
            (e) => !(e.type === "offer" && e.offerId === offerId)
          ),
        },
      };
    });
  }, []);

  const addBreak = useCallback(
    (date: string, breakType: BreakType, label?: string) => {
      setState((s) => {
        if (!s) return s;
        return {
          ...s,
          schedule: {
            ...s.schedule,
            [date]: [
              ...(s.schedule[date] ?? []),
              { id: nextEntryId(), type: "break" as const, breakType, label },
            ],
          },
        };
      });
    },
    []
  );

  const removeEntry = useCallback((date: string, entryId: string) => {
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        schedule: {
          ...s.schedule,
          [date]: (s.schedule[date] ?? []).filter((e) => e.id !== entryId),
        },
      };
    });
  }, []);

  const updateEntryTime = useCallback(
    (date: string, entryId: string, startTime: string, endTime: string) => {
      setState((s) => {
        if (!s) return s;
        return {
          ...s,
          schedule: {
            ...s.schedule,
            [date]: (s.schedule[date] ?? []).map((e) =>
              e.id === entryId ? { ...e, startTime, endTime } : e
            ),
          },
        };
      });
    },
    []
  );

  const dismissOffer = useCallback((offerId: string) => {
    setState((s) => {
      if (!s) return s;
      if (s.dismissed.includes(offerId)) return s;
      return { ...s, dismissed: [...s.dismissed, offerId] };
    });
  }, []);

  const undismissOffer = useCallback((offerId: string) => {
    setState((s) => {
      if (!s) return s;
      return { ...s, dismissed: s.dismissed.filter((id) => id !== offerId) };
    });
  }, []);

  const setNote = useCallback((date: string, text: string) => {
    setState((s) => (s ? { ...s, notes: { ...s.notes, [date]: text } } : s));
  }, []);

  const resetAll = useCallback(() => {
    if (confirm("Wirklich alles zurücksetzen? Alle geplanten Tage werden gelöscht.")) {
      clearState();
      setState({ ...DEFAULT_STATE });
    }
  }, []);

  const handleExport = useCallback(() => {
    if (!state) return;
    const json = exportState(state);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `urlaubsplan-schwarzwald-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importState(reader.result as string);
      if (result) {
        setState(result);
        saveState(result);
      } else {
        alert("Ungültige Datei — konnte den Plan nicht lesen.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-forest-deep text-cream flex items-center justify-center">
        <Loader2 size={20} className="animate-spin mr-2" /> Lädt …
      </div>
    );
  }

  const activeDay = TRIP_DAYS.find((d) => d.date === activeDate) ?? TRIP_DAYS[0];
  const scheduleEntries = state.schedule[activeDate] ?? [];
  const plannedIds = getPlannedOfferIds(scheduleEntries);
  const plannedOffers = plannedIds
    .map((id) => offerById(id, state.customOffers))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  const allPlannedIds = Object.values(state.schedule)
    .flat()
    .filter((e) => e.type === "offer" && e.offerId)
    .map((e) => e.offerId!);

  const allPlannedSet = new Set(allPlannedIds);
  const dismissedSet = new Set(state.dismissed);

  const filteredOffers = sortOffers(
    OFFERS.filter((o) => {
      if (o.distance > maxDistance) return false;
      if (hideDismissed && dismissedSet.has(o.id)) return false;
      if (hidePlanned && allPlannedSet.has(o.id)) return false;
      if (filter === "all") return true;
      if (filter === "card") return o.cardIncluded;
      return o.tags.includes(filter);
    }),
    sortKey,
    state.schedule,
    activeDate
  );

  const dismissedCount = state.dismissed.length;
  const plannedCount = allPlannedSet.size;

  const counts = Object.fromEntries(
    TRIP_DAYS.map((d) => [d.date, (state.schedule[d.date] ?? []).length])
  );

  return (
    <div className="min-h-screen bg-forest-gradient text-cream relative">
      <TopoBackground />

      <div className="max-w-[1100px] mx-auto relative z-10">
        <Header />
        <HochschwarzwaldHint />

        {/* Day Strip */}
        <section className="px-5 pb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-serif font-light italic text-[22px] text-cream m-0 -tracking-[0.01em]">
              Die Tage
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowWeek(!showWeek)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] tracking-wider uppercase transition-colors ${
                  showWeek
                    ? "bg-moss/80 text-cream"
                    : "bg-transparent text-moss-soft hover:text-cream border border-cream/15"
                }`}
              >
                <Calendar size={10} /> Woche
              </button>
              <div className="text-[10px] text-moss-soft tracking-wider uppercase flex items-center gap-1">
                {saveStatus === "saving" && (
                  <>
                    <Loader2 size={11} className="animate-spin" /> Speichert
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <Check size={11} /> Gespeichert
                  </>
                )}
                {saveStatus === "idle" && (
                  <>
                    <Save size={11} /> Auto-Save
                  </>
                )}
              </div>
            </div>
          </div>
          <DayStrip
            days={TRIP_DAYS}
            activeDate={activeDate}
            counts={counts}
            onSelect={setActiveDate}
          />
        </section>

        {showWeek && (
          <section className="px-5 pb-5">
            <WeekOverview
              schedule={state.schedule}
              customOffers={state.customOffers}
              onDayClick={(date) => {
                setActiveDate(date);
                setShowWeek(false);
              }}
            />
          </section>
        )}

        <section className="px-5 pb-7">
          <DayDetail
            day={activeDay}
            plannedOffers={plannedOffers}
            note={state.notes[activeDate] ?? ""}
            scheduleEntries={scheduleEntries}
            customOffers={state.customOffers}
            onRemove={(id) => removeFromDay(id, activeDate)}
            onNoteChange={(text) => setNote(activeDate, text)}
            onAddBreak={(breakType, label) => addBreak(activeDate, breakType, label)}
            onRemoveEntry={(entryId) => removeEntry(activeDate, entryId)}
            onUpdateEntryTime={(entryId, start, end) =>
              updateEntryTime(activeDate, entryId, start, end)
            }
          />
        </section>

        {/* View Toggle + Export/Import */}
        <section className="px-5 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-moss text-cream"
                    : "bg-stone/40 text-moss-soft hover:text-cream"
                }`}
              >
                <List size={15} /> Angebote
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  viewMode === "map"
                    ? "bg-moss text-cream"
                    : "bg-stone/40 text-moss-soft hover:text-cream"
                }`}
              >
                <Map size={15} /> Karte & Routen
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-[11px] tracking-wider uppercase text-moss-soft hover:text-cream border border-cream/15 hover:border-cream/30 transition-colors"
              >
                <Download size={12} /> Export
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-[11px] tracking-wider uppercase text-moss-soft hover:text-cream border border-cream/15 hover:border-cream/30 transition-colors"
              >
                <Upload size={12} /> Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </section>

        {/* Catalog or Map */}
        {viewMode === "list" ? (
          <section className="px-5 pb-10">
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
              <h2 className="font-serif font-light italic text-[22px] text-cream m-0 -tracking-[0.01em]">
                Angebote
              </h2>
              <div className="flex items-center gap-3">
                {dismissedCount > 0 && (
                  <label className="flex items-center gap-1.5 text-[10px] text-moss-soft cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideDismissed}
                      onChange={(e) => setHideDismissed(e.target.checked)}
                      className="accent-amber w-3 h-3"
                    />
                    {dismissedCount} ausgeblendet
                  </label>
                )}
                {plannedCount > 0 && (
                  <label className="flex items-center gap-1.5 text-[10px] text-moss-soft cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hidePlanned}
                      onChange={(e) => setHidePlanned(e.target.checked)}
                      className="accent-amber w-3 h-3"
                    />
                    Geplante ausblenden
                  </label>
                )}
              </div>
            </div>
            <div className="text-[11px] text-moss-soft mb-4">
              {filteredOffers.length} Vorschläge — kuratiert rund um Löffingen
            </div>

            <FilterBar
              filter={filter}
              maxDistance={maxDistance}
              sortKey={sortKey}
              onFilterChange={setFilter}
              onDistanceChange={setMaxDistance}
              onSortChange={setSortKey}
            />

            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
              {filteredOffers.length === 0 ? (
                <div className="col-span-full py-7 text-center text-moss-soft italic text-[13px]">
                  Nichts gefunden — Filter lockern.
                </div>
              ) : (
                filteredOffers.map((o) => (
                  <OfferCard
                    key={o.id}
                    offer={o}
                    activeDay={activeDate}
                    schedule={state.schedule}
                    isDismissed={dismissedSet.has(o.id)}
                    onOpenDetail={() => setModalOffer(o)}
                  />
                ))
              )}
            </div>
          </section>
        ) : (
          <section className="px-5 pb-10">
            <MapView
              plannedOfferIds={allPlannedIds}
              activeDayOfferIds={plannedIds}
              activeDay={activeDate}
              schedule={state.schedule}
              onAddHike={(hikeId, date) => addHikeToDay(hikeId, date)}
            />
          </section>
        )}

        <Footer onReset={resetAll} />
      </div>

      {/* Detail Modal */}
      {modalOffer && (
        <OfferModal
          offer={modalOffer}
          activeDay={activeDate}
          schedule={state.schedule}
          isDismissed={dismissedSet.has(modalOffer.id)}
          onClose={() => setModalOffer(null)}
          onAdd={(date) => addToDay(modalOffer.id, date)}
          onDismiss={() => dismissOffer(modalOffer.id)}
          onUndismiss={() => undismissOffer(modalOffer.id)}
        />
      )}
    </div>
  );
}
