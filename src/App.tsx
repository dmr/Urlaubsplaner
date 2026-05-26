import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { AppState, DEFAULT_STATE, BreakType, Offer } from "@/lib/types";
import { loadState, saveState, clearState, decodeStateFromUrl } from "@/lib/storage";
import { offerById, getPlannedOfferIds } from "@/lib/helpers";
import { sortOffers, SortKey } from "@/lib/ranking";
import { OFFERS } from "@/data/offers";
import { hikingRoutesAsOffers } from "@/data/hikingRoutes";
import { TRIP_DAYS } from "@/data/tripDays";

const ALL_OFFERS = [...OFFERS, ...hikingRoutesAsOffers()];
import TopoBackground from "@/components/TopoBackground";
import Header from "@/components/Header";
import HomeBase from "@/components/HomeBase";
import DayStrip from "@/components/DayStrip";
import DayDetail from "@/components/DayDetail";
import BottomSheet from "@/components/BottomSheet";
import WeekOverview from "@/components/WeekOverview";
import FilterBar, { FilterKey } from "@/components/FilterBar";
import OfferCard from "@/components/OfferCard";
import OfferModal from "@/components/OfferModal";
import AddCustomOffer from "@/components/AddCustomOffer";
import PlanManager from "@/components/PlanManager";
import Footer from "@/components/Footer";
import { Loader2, Save, Check, List, Map, Calendar, Sun, Moon, Plus, ChevronUp, X } from "lucide-react";

const MapView = lazy(() => import("@/components/MapView"));

type SaveStatus = "idle" | "saving" | "saved";
type ViewMode = "list" | "map";
type Theme = "dark" | "light";

let entryCounter = 0;
function nextEntryId(): string {
  return `entry-${Date.now()}-${++entryCounter}`;
}

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeDate, setActiveDate] = useState<string>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const match = TRIP_DAYS.find((d) => d.date === today);
    if (match) return match.date;
    const future = TRIP_DAYS.find((d) => d.date >= today);
    return future?.date ?? TRIP_DAYS[0].date;
  });
  const [filter, setFilter] = useState<FilterKey>("all");
  const [maxDistance, setMaxDistance] = useState<number>(80);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showWeek, setShowWeek] = useState(false);
  const [showDaySheet, setShowDaySheet] = useState(false);
  const [highlightedOfferId, setHighlightedOfferId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const openDaySheet = useCallback((date?: string) => {
    if (date) setActiveDate(date);
    const nav = navRef.current;
    if (nav) {
      const navTop = nav.offsetTop;
      if (window.scrollY < navTop) {
        window.scrollTo({ top: navTop, behavior: "smooth" });
      }
    }
    setShowDaySheet(true);
  }, []);
  const [sortKey, setSortKey] = useState<SortKey>("empfohlen");
  const [hidePlanned, setHidePlanned] = useState(false);
  const [hideDismissed, setHideDismissed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOffer, setModalOffer] = useState<Offer | null>(null);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [showPlanManager, setShowPlanManager] = useState(false);
  const [undoAction, setUndoAction] = useState<{ label: string; undo: () => void } | null>(null);

  const openModal = useCallback((offer: Offer) => {
    setModalOffer(offer);
    window.history.pushState({ modal: offer.id }, "", `#${offer.id}`);
  }, []);

  const closeModal = useCallback(() => {
    setModalOffer(null);
    if (window.location.hash) {
      window.history.back();
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const found = ALL_OFFERS.find((o) => o.id === hash) || state?.customOffers.find((o) => o.id === hash);
      if (found) setModalOffer(found);
    }

    const onPopState = () => {
      const h = window.location.hash.slice(1);
      if (h) {
        const f = ALL_OFFERS.find((o) => o.id === h) || state?.customOffers.find((o) => o.id === h);
        setModalOffer(f ?? null);
      } else {
        setModalOffer(null);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const loaded = loadState();
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get("plan");
    if (planParam) {
      const decoded = decodeStateFromUrl(planParam);
      if (decoded) {
        for (const [date, offerIds] of Object.entries(decoded.schedule)) {
          const existing = loaded.schedule[date] ?? [];
          const existingSet = new Set(existing.filter((e) => e.type === "offer").map((e) => e.offerId));
          for (const offerId of offerIds) {
            if (!existingSet.has(offerId)) {
              existing.push({ id: `entry-url-${Date.now()}-${Math.random()}`, type: "offer", offerId });
            }
          }
          loaded.schedule[date] = existing;
        }
        if (decoded.homeBaseName) loaded.homeBase = { ...loaded.homeBase, name: decoded.homeBaseName };
        window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      }
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

  const removeFromDay = useCallback((offerId: string, date: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const removed = (prev.schedule[date] ?? []).find((e) => e.type === "offer" && e.offerId === offerId);
      const next = {
        ...prev,
        schedule: {
          ...prev.schedule,
          [date]: (prev.schedule[date] ?? []).filter(
            (e) => !(e.type === "offer" && e.offerId === offerId)
          ),
        },
      };
      if (removed) {
        const offer = offerById(offerId, prev.customOffers);
        setUndoAction({
          label: `${offer?.name ?? "Eintrag"} entfernt`,
          undo: () => {
            setState((s) => s ? {
              ...s,
              schedule: { ...s.schedule, [date]: [...(s.schedule[date] ?? []), removed] },
            } : s);
            setUndoAction(null);
          },
        });
        setTimeout(() => setUndoAction((a) => a?.label === `${offer?.name ?? "Eintrag"} entfernt` ? null : a), 5000);
      }
      return next;
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

  const addCustomOffer = useCallback((offer: Offer) => {
    setState((s) => {
      if (!s) return s;
      return { ...s, customOffers: [...s.customOffers, offer] };
    });
    setShowAddCustom(false);
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


  if (!state) {
    return (
      <div className="min-h-screen bg-forest-deep text-cream flex items-center justify-center">
        <Loader2 size={20} className="animate-spin mr-2" /> Lädt …
      </div>
    );
  }

  const allOffers = [...ALL_OFFERS, ...state.customOffers];

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

  const q = searchQuery.toLowerCase().trim();

  const filteredOffers = sortOffers(
    allOffers.filter((o) => {
      if (o.distance > maxDistance) return false;
      if (hideDismissed && dismissedSet.has(o.id)) return false;
      if (hidePlanned && allPlannedSet.has(o.id)) return false;
      if (q) {
        const haystack = `${o.name} ${o.sub} ${o.location} ${o.description} ${o.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
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
        <HomeBase
          name={state.homeBase.name}
          onChangeName={(name) => setState((s) => s ? { ...s, homeBase: { ...s.homeBase, name } } : s)}
        />

        {/* Sticky navigation bar */}
        <nav ref={navRef} className="sticky top-0 z-30 border-b border-cream/8" style={{ backgroundColor: "var(--c-forest-deep)" }}>
          {/* Row 1: Controls */}
          <div className="px-5 pt-2.5 pb-1.5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="font-serif italic text-[15px] text-cream">
                {activeDay.full}, {activeDay.day}. Mai
              </span>
              <span className="text-[10px] text-moss-soft">
                {Object.values(counts).reduce((a, b) => a + b, 0)} geplant
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                  viewMode === "list" ? "bg-moss text-cream" : "text-moss-soft hover:text-cream"
                }`}
              >
                <List size={11} /> Liste
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                  viewMode === "map" ? "bg-moss text-cream" : "text-moss-soft hover:text-cream"
                }`}
              >
                <Map size={11} /> Karte
              </button>
              <span className="w-px h-4 bg-cream/10 mx-0.5" />
              <button
                onClick={() => setShowWeek(!showWeek)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
                  showWeek ? "bg-moss/80 text-cream" : "text-moss-soft hover:text-cream"
                }`}
              >
                <Calendar size={10} />
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center w-6 h-6 rounded-full text-moss-soft hover:text-cream transition-colors"
              >
                {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
              </button>
              {/* Save indicator — tap opens Plan Manager */}
              <button
                onClick={() => setShowPlanManager(true)}
                className="text-[9px] text-moss-soft tracking-wider uppercase flex items-center gap-0.5 ml-1 hover:text-cream transition-colors"
                title="Plan teilen / exportieren"
              >
                {saveStatus === "saving" && <Loader2 size={10} className="animate-spin" />}
                {saveStatus === "saved" && <Check size={10} />}
                {saveStatus === "idle" && <Save size={10} />}
              </button>
            </div>
          </div>
          {/* Row 2: Day Strip */}
          <div className="px-5 pb-2.5">
            <DayStrip
              days={TRIP_DAYS}
              activeDate={activeDate}
              counts={counts}
              onSelect={(date) => openDaySheet(date)}
            />
          </div>
        </nav>

        {showWeek && (
          <section className="px-5 py-4">
            <WeekOverview
              schedule={state.schedule}
              customOffers={state.customOffers}
              onDayClick={(date) => {
                setShowWeek(false);
                openDaySheet(date);
              }}
            />
          </section>
        )}

        {/* Catalog or Map */}
        {viewMode === "list" ? (
          <section className="px-5 pb-10">
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
              <h2 className="font-serif font-light italic text-[22px] text-cream m-0 -tracking-[0.01em]">
                Angebote
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddCustom(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] tracking-wider uppercase text-amber hover:text-cream bg-amber/15 hover:bg-amber/25 border border-amber/30 transition-colors"
                >
                  <Plus size={10} /> Eigener Ort
                </button>
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
              searchQuery={searchQuery}
              onFilterChange={setFilter}
              onDistanceChange={setMaxDistance}
              onSortChange={setSortKey}
              onSearchChange={setSearchQuery}
            />

            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
              {filteredOffers.length === 0 ? (
                <div className="col-span-full py-7 text-center text-moss-soft text-[14px] space-y-2">
                  <div className="italic">Nichts gefunden.</div>
                  <button
                    onClick={() => { setFilter("all"); setMaxDistance(80); setSearchQuery(""); }}
                    className="text-amber underline text-[13px]"
                  >
                    Alle Filter zurücksetzen
                  </button>
                </div>
              ) : (
                filteredOffers.map((o) => (
                  <OfferCard
                    key={o.id}
                    offer={o}
                    activeDay={activeDate}
                    schedule={state.schedule}
                    isDismissed={dismissedSet.has(o.id)}
                    onOpenDetail={() => openModal(o)}
                  />
                ))
              )}
            </div>
          </section>
        ) : (
          <section className="px-5 pb-10">
            <Suspense fallback={<div className="py-20 text-center text-moss-soft"><Loader2 size={20} className="animate-spin inline mr-2" />Karte lädt …</div>}>
              <MapView
                plannedOfferIds={allPlannedIds}
                activeDayOfferIds={plannedIds}
              />
            </Suspense>
          </section>
        )}

        <Footer onReset={resetAll} onShare={() => setShowPlanManager(true)} />
      </div>

      {/* Detail Modal */}
      {modalOffer && (
        <OfferModal
          offer={modalOffer}
          activeDay={activeDate}
          schedule={state.schedule}
          isDismissed={dismissedSet.has(modalOffer.id)}
          onClose={closeModal}
          onAdd={(date) => addToDay(modalOffer.id, date)}
          onDismiss={() => dismissOffer(modalOffer.id)}
          onUndismiss={() => undismissOffer(modalOffer.id)}
        />
      )}

      {showAddCustom && (
        <AddCustomOffer
          onAdd={addCustomOffer}
          onClose={() => setShowAddCustom(false)}
        />
      )}

      {/* Day Detail Bottom Sheet */}
      <BottomSheet
        open={showDaySheet}
        onClose={() => setShowDaySheet(false)}
        title={`${activeDay.full}, ${activeDay.day}. Mai`}
        subtitle={`Tag ${activeDay.day} von 7 — Tagesplan bearbeiten`}
        badge={scheduleEntries.length > 0 ? `${scheduleEntries.length} Einträge` : "leer"}
        accent="#6a9458"
      >
        <DayDetail
          day={activeDay}
          plannedOffers={plannedOffers}
          note={state.notes[activeDate] ?? ""}
          scheduleEntries={scheduleEntries}
          customOffers={state.customOffers}
          highlightedId={highlightedOfferId}
          onRemove={(id) => removeFromDay(id, activeDate)}
          onNoteChange={(text) => setNote(activeDate, text)}
          onAddBreak={(breakType, label) => addBreak(activeDate, breakType, label)}
          onRemoveEntry={(entryId) => removeEntry(activeDate, entryId)}
          onHighlight={setHighlightedOfferId}
          onOpenDetail={(offerId) => {
            setShowDaySheet(false);
            const found = allOffers.find((o) => o.id === offerId);
            if (found) openModal(found);
          }}
          onUpdateEntryTime={(entryId, start, end) =>
            updateEntryTime(activeDate, entryId, start, end)
          }
        />
      </BottomSheet>

      {showPlanManager && (
        <PlanManager
          state={state}
          onApply={(merged) => {
            setState(merged);
            saveState(merged);
            setShowPlanManager(false);
          }}
          onClose={() => setShowPlanManager(false)}
        />
      )}

      {/* Undo toast */}
      {undoAction && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[60] bg-ink text-cream px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-[13px] max-w-[90vw]">
          <span>{undoAction.label}</span>
          <button
            onClick={undoAction.undo}
            className="text-amber font-semibold hover:text-cream transition-colors whitespace-nowrap"
          >
            Rückgängig
          </button>
          <button
            onClick={() => setUndoAction(null)}
            className="text-cream/50 hover:text-cream ml-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
}

function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-moss text-cream shadow-lg flex items-center justify-center hover:bg-moss/80 transition-colors"
      aria-label="Nach oben"
    >
      <ChevronUp size={20} />
    </button>
  );
}
