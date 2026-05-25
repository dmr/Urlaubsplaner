import { useState, useEffect, useCallback } from "react";
import { AppState, DEFAULT_STATE } from "@/lib/types";
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
import Footer from "@/components/Footer";
import { Loader2, Save, Check } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved";

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeDate, setActiveDate] = useState<string>(TRIP_DAYS[0].date);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [maxDistance, setMaxDistance] = useState<number>(60);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Initial load
  useEffect(() => {
    setState(loadState());
  }, []);

  // Debounced auto-save
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
      return { ...s, plan: { ...s.plan, [date]: [...current, offerId] } };
    });
  }, []);

  const removeFromDay = useCallback((offerId: string, date: string) => {
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        plan: {
          ...s.plan,
          [date]: (s.plan[date] ?? []).filter((id) => id !== offerId),
        },
      };
    });
  }, []);

  const setNote = useCallback((date: string, text: string) => {
    setState((s) => (s ? { ...s, notes: { ...s.notes, [date]: text } } : s));
  }, []);

  const resetAll = useCallback(() => {
    if (
      confirm("Wirklich alles zurücksetzen? Alle geplanten Tage werden gelöscht.")
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

  const activeDay = TRIP_DAYS.find((d) => d.date === activeDate) ?? TRIP_DAYS[0];
  const plannedIds = state.plan[activeDate] ?? [];
  const plannedOffers = plannedIds
    .map((id) => offerById(id, state.customOffers))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  const filteredOffers = OFFERS.filter((o) => {
    if (o.distance > maxDistance) return false;
    if (filter === "all") return true;
    if (filter === "card") return o.cardIncluded;
    return o.tags.includes(filter);
  });

  const counts = Object.fromEntries(
    TRIP_DAYS.map((d) => [d.date, (state.plan[d.date] ?? []).length])
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
            onRemove={(id) => removeFromDay(id, activeDate)}
            onNoteChange={(text) => setNote(activeDate, text)}
          />
        </section>

        {/* Catalog */}
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

        <Footer onReset={resetAll} />
      </div>
    </div>
  );
}
