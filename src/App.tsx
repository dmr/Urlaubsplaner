import { useState, useEffect, useCallback } from "react";
import { AppState, DEFAULT_STATE, BreakType } from "@/lib/types";
import { loadState, saveState, clearState } from "@/lib/storage";
import { offerById } from "@/lib/helpers";
import { OFFERS } from "@/data/offers";
import { TRIP_DAYS } from "@/data/tripDays";
import TopoBackground from "@/components/TopoBackground";
import Header from "@/components/Header";
import HochschwarzwaldHint from "@/components/HochschwarzwaldHint";
import DayStrip from "@/components/DayStrip";
import DayDetail from "@/components/DayDetail";
import FilterBar, { FilterKey } from "@/components/FilterBar";
import OfferCard from "@/components/OfferCard";
import MapView from "@/components/MapView";
import Footer from "@/components/Footer";
import { Loader2, Save, Check, List, Map } from "lucide-react";

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

  useEffect(() => {
    const loaded = loadState();
    if (!loaded.schedule) {
      loaded.schedule = {};
    }
    // Migrate legacy plan entries to schedule
    for (const [date, offerIds] of Object.entries(loaded.plan)) {
      const existing = loaded.schedule[date] ?? [];
      const existingOfferIds = new Set(
        existing.filter((e) => e.type === "offer").map((e) => e.offerId)
      );
      for (const offerId of offerIds) {
        if (!existingOfferIds.has(offerId)) {
          existing.push({
            id: nextEntryId(),
            type: "offer",
            offerId,
          });
        }
      }
      loaded.schedule[date] = existing;
    }
    setState(loaded);
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
      const current = s.plan[date] ?? [];
      if (current.includes(offerId)) return s;
      const schedule = { ...s.schedule };
      const entries = [...(schedule[date] ?? [])];
      entries.push({ id: nextEntryId(), type: "offer", offerId });
      schedule[date] = entries;
      return {
        ...s,
        plan: { ...s.plan, [date]: [...current, offerId] },
        schedule,
      };
    });
  }, []);

  const removeFromDay = useCallback((offerId: string, date: string) => {
    setState((s) => {
      if (!s) return s;
      const schedule = { ...s.schedule };
      const entries = (schedule[date] ?? []).filter(
        (e) => !(e.type === "offer" && e.offerId === offerId)
      );
      schedule[date] = entries;
      return {
        ...s,
        plan: {
          ...s.plan,
          [date]: (s.plan[date] ?? []).filter((id) => id !== offerId),
        },
        schedule,
      };
    });
  }, []);

  const addBreak = useCallback(
    (date: string, breakType: BreakType, label?: string) => {
      setState((s) => {
        if (!s) return s;
        const schedule = { ...s.schedule };
        const entries = [...(schedule[date] ?? [])];
        entries.push({
          id: nextEntryId(),
          type: "break",
          breakType,
          label,
        });
        schedule[date] = entries;
        return { ...s, schedule };
      });
    },
    []
  );

  const removeEntry = useCallback((date: string, entryId: string) => {
    setState((s) => {
      if (!s) return s;
      const schedule = { ...s.schedule };
      const entries = (schedule[date] ?? []).filter((e) => e.id !== entryId);
      schedule[date] = entries;
      // Also sync plan
      const plan = { ...s.plan };
      const removed = (s.schedule[date] ?? []).find((e) => e.id === entryId);
      if (removed?.type === "offer" && removed.offerId) {
        plan[date] = (plan[date] ?? []).filter((id) => id !== removed.offerId);
      }
      return { ...s, schedule, plan };
    });
  }, []);

  const updateEntryTime = useCallback(
    (date: string, entryId: string, startTime: string, endTime: string) => {
      setState((s) => {
        if (!s) return s;
        const schedule = { ...s.schedule };
        const entries = (schedule[date] ?? []).map((e) =>
          e.id === entryId ? { ...e, startTime, endTime } : e
        );
        schedule[date] = entries;
        return { ...s, schedule };
      });
    },
    []
  );

  const setNote = useCallback((date: string, text: string) => {
    setState((s) => (s ? { ...s, notes: { ...s.notes, [date]: text } } : s));
  }, []);

  const resetAll = useCallback(() => {
    if (
      confirm(
        "Wirklich alles zurücksetzen? Alle geplanten Tage werden gelöscht."
      )
    ) {
      clearState();
      setState({ ...DEFAULT_STATE });
    }
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-forest-deep text-cream flex items-center justify-center">
        <Loader2 size={20} className="animate-spin mr-2" /> Lädt …
      </div>
    );
  }

  const activeDay =
    TRIP_DAYS.find((d) => d.date === activeDate) ?? TRIP_DAYS[0];
  const plannedIds = state.plan[activeDate] ?? [];
  const plannedOffers = plannedIds
    .map((id) => offerById(id, state.customOffers))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  const scheduleEntries = state.schedule[activeDate] ?? [];

  const filteredOffers = OFFERS.filter((o) => {
    if (o.distance > maxDistance) return false;
    if (filter === "all") return true;
    if (filter === "card") return o.cardIncluded;
    return o.tags.includes(filter);
  });

  const counts = Object.fromEntries(
    TRIP_DAYS.map((d) => [
      d.date,
      (d.date in state.schedule
        ? state.schedule[d.date]
        : (state.plan[d.date] ?? []).map(() => null)
      ).length,
    ])
  );

  return (
    <div className="min-h-screen bg-forest-gradient text-cream relative">
      <TopoBackground />

      <div className="max-w-[1100px] mx-auto relative z-10">
        <Header />
        <HochschwarzwaldHint />

        {/* Day Strip */}
        <section className="px-5 pb-5">
          <div className="flex justify-between items-baseline mb-3">
            <h2 className="font-serif font-light italic text-[22px] text-cream m-0 -tracking-[0.01em]">
              Die Tage
            </h2>
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
          <DayStrip
            days={TRIP_DAYS}
            activeDate={activeDate}
            counts={counts}
            onSelect={setActiveDate}
          />
        </section>

        {/* Day Detail */}
        <section className="px-5 pb-7">
          <DayDetail
            day={activeDay}
            plannedOffers={plannedOffers}
            note={state.notes[activeDate] ?? ""}
            scheduleEntries={scheduleEntries}
            customOffers={state.customOffers}
            onRemove={(id) => removeFromDay(id, activeDate)}
            onNoteChange={(text) => setNote(activeDate, text)}
            onAddBreak={(breakType, label) =>
              addBreak(activeDate, breakType, label)
            }
            onRemoveEntry={(entryId) => removeEntry(activeDate, entryId)}
            onUpdateEntryTime={(entryId, start, end) =>
              updateEntryTime(activeDate, entryId, start, end)
            }
          />
        </section>

        {/* View Toggle */}
        <section className="px-5 pb-4">
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
        </section>

        {/* Catalog or Map */}
        {viewMode === "list" ? (
          <section className="px-5 pb-10">
            <h2 className="font-serif font-light italic text-[22px] text-cream m-0 -tracking-[0.01em]">
              Angebote
            </h2>
            <div className="text-[11px] text-moss-soft mb-4">
              {filteredOffers.length} Vorschläge — kuratiert rund um Löffingen
            </div>

            <FilterBar
              filter={filter}
              maxDistance={maxDistance}
              onFilterChange={setFilter}
              onDistanceChange={setMaxDistance}
            />

            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
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
                    onAdd={(date) => addToDay(o.id, date)}
                  />
                ))
              )}
            </div>
          </section>
        ) : (
          <section className="px-5 pb-10">
            <MapView plannedOfferIds={plannedIds} />
          </section>
        )}

        <Footer onReset={resetAll} />
      </div>
    </div>
  );
}
