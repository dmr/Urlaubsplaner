import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import { AppState, DEFAULT_STATE, BreakType, Offer, RegionId, RegionState } from "@/lib/types";
import { loadState, saveState, clearState, decodeStateFromUrl, SharedPlan } from "@/lib/storage";
import { offerById, getPlannedOfferIds, formatDayMonth } from "@/lib/helpers";
import { sortOffers, SortKey } from "@/lib/ranking";
import { offersForRegion } from "@/data/regionData";
import { REGIONS } from "@/data/regions";
import { computeTripDays } from "@/lib/dateUtils";
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
import RegionSetupModal from "@/components/RegionSetupModal";
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
  const [activeDate, setActiveDate] = useState<string>("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [maxDistance, setMaxDistance] = useState<number>(90);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showWeek, setShowWeek] = useState(false);
  const [showDaySheet, setShowDaySheet] = useState(false);
  const [highlightedOfferId, setHighlightedOfferId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const [sortKey, setSortKey] = useState<SortKey>("empfohlen");
  const [hidePlanned, setHidePlanned] = useState(() => localStorage.getItem("hidePlanned") === "true");
  const [hideDismissed, setHideDismissed] = useState(() => localStorage.getItem("hideDismissed") !== "false");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOffer, setModalOffer] = useState<Offer | null>(null);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [showPlanManager, setShowPlanManager] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [undoAction, setUndoAction] = useState<{ label: string; undo: () => void } | null>(null);
  const [urlImportData, setUrlImportData] = useState<SharedPlan | null>(null);

  const openDaySheet = useCallback((date?: string) => {
    if (date) setActiveDate(date);
    const nav = navRef.current;
    if (nav) {
      const navTop = nav.offsetTop;
      if (window.scrollY < navTop) window.scrollTo({ top: navTop, behavior: "smooth" });
    }
    setShowDaySheet(true);
  }, []);

  const openModal = useCallback((offer: Offer) => {
    setModalOffer(offer);
    window.history.pushState({ modal: offer.id }, "", `#${offer.id}`);
  }, []);

  const closeModal = useCallback(() => {
    setModalOffer(null);
    if (window.location.hash) window.history.back();
  }, []);

  useEffect(() => {
    const lookup = (id: string) => offerById(id);
    const hash = window.location.hash.slice(1);
    if (hash) {
      const found = lookup(hash);
      if (found) setModalOffer(found);
    }
    const onPopState = () => {
      const h = window.location.hash.slice(1);
      setModalOffer(h ? lookup(h) ?? null : null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const [theme, setTheme] = useState<Theme>(() =>
    (typeof window !== "undefined" && (localStorage.getItem("theme") as Theme)) || "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const loaded = loadState();
    const planParam = new URLSearchParams(window.location.search).get("plan");
    if (planParam) {
      const decoded = decodeStateFromUrl(planParam);
      if (decoded) {
        setUrlImportData(decoded);
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

  const updateRegion = useCallback((updater: (r: RegionState) => RegionState) => {
    setState((s) => {
      if (!s) return s;
      return { ...s, regions: { ...s.regions, [s.activeRegion]: updater(s.regions[s.activeRegion]) } };
    });
  }, []);

  const switchRegion = useCallback((region: RegionId) => {
    setState((s) => (s ? { ...s, activeRegion: region } : s));
    setFilter("all");
    setSearchQuery("");
    setHighlightedOfferId(null);
  }, []);

  const applySetup = useCallback(
    (regionId: RegionId, startDate: string, endDate: string, homeBaseName: string) => {
      setState((s) => {
        if (!s) return s;
        return {
          ...s,
          activeRegion: regionId,
          regions: {
            ...s.regions,
            [regionId]: {
              ...s.regions[regionId],
              startDate,
              endDate,
              homeBaseName,
            },
          },
        };
      });
      setShowSetup(false);
      // Reset active date so it picks first day of new range
      setActiveDate("");
    },
    []
  );

  const addToDay = useCallback((offerId: string, date: string) => {
    updateRegion((r) => {
      const entries = r.schedule[date] ?? [];
      if (entries.some((e) => e.type === "offer" && e.offerId === offerId)) return r;
      return { ...r, schedule: { ...r.schedule, [date]: [...entries, { id: nextEntryId(), type: "offer", offerId }] } };
    });
  }, [updateRegion]);

  const removeFromDay = useCallback((offerId: string, date: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const r = prev.regions[prev.activeRegion];
      const removed = (r.schedule[date] ?? []).find((e) => e.type === "offer" && e.offerId === offerId);
      const nextRegion = {
        ...r,
        schedule: { ...r.schedule, [date]: (r.schedule[date] ?? []).filter((e) => !(e.type === "offer" && e.offerId === offerId)) },
      };
      if (removed) {
        const offer = offerById(offerId, r.customOffers);
        const label = `${offer?.name ?? "Eintrag"} entfernt`;
        setUndoAction({
          label,
          undo: () => {
            updateRegion((rr) => ({ ...rr, schedule: { ...rr.schedule, [date]: [...(rr.schedule[date] ?? []), removed] } }));
            setUndoAction(null);
          },
        });
        setTimeout(() => setUndoAction((a) => (a?.label === label ? null : a)), 5000);
      }
      return { ...prev, regions: { ...prev.regions, [prev.activeRegion]: nextRegion } };
    });
  }, [updateRegion]);

  const addBreak = useCallback((date: string, breakType: BreakType, label?: string) => {
    updateRegion((r) => ({ ...r, schedule: { ...r.schedule, [date]: [...(r.schedule[date] ?? []), { id: nextEntryId(), type: "break", breakType, label }] } }));
  }, [updateRegion]);

  const removeEntry = useCallback((date: string, entryId: string) => {
    updateRegion((r) => ({ ...r, schedule: { ...r.schedule, [date]: (r.schedule[date] ?? []).filter((e) => e.id !== entryId) } }));
  }, [updateRegion]);

  const updateEntryTime = useCallback((date: string, entryId: string, startTime: string, endTime: string) => {
    updateRegion((r) => ({ ...r, schedule: { ...r.schedule, [date]: (r.schedule[date] ?? []).map((e) => (e.id === entryId ? { ...e, startTime, endTime } : e)) } }));
  }, [updateRegion]);

  const dismissOffer = useCallback((offerId: string) => {
    updateRegion((r) => (r.dismissed.includes(offerId) ? r : { ...r, dismissed: [...r.dismissed, offerId] }));
  }, [updateRegion]);

  const undismissOffer = useCallback((offerId: string) => {
    updateRegion((r) => ({ ...r, dismissed: r.dismissed.filter((id) => id !== offerId) }));
  }, [updateRegion]);

  const addCustomOffer = useCallback((offer: Offer) => {
    updateRegion((r) => ({ ...r, customOffers: [...r.customOffers, offer] }));
    setShowAddCustom(false);
  }, [updateRegion]);

  const setNote = useCallback((date: string, text: string) => {
    updateRegion((r) => ({ ...r, notes: { ...r.notes, [date]: text } }));
  }, [updateRegion]);

  const setHomeBaseName = useCallback((name: string) => {
    updateRegion((r) => ({ ...r, homeBaseName: name }));
  }, [updateRegion]);

  const resetAll = useCallback(() => {
    if (confirm("Wirklich alles zurücksetzen? Alle geplanten Tage werden gelöscht.")) {
      clearState();
      setState(structuredClone(DEFAULT_STATE));
      setActiveDate("");
    }
  }, []);

  // Derive trip days from active region
  const activeRegion = state?.activeRegion;
  const region = state && activeRegion ? state.regions[activeRegion] : null;
  const tripDays = useMemo(
    () => (region?.startDate && region?.endDate ? computeTripDays(region.startDate, region.endDate) : []),
    [region?.startDate, region?.endDate]
  );

  // Ensure activeDate is within tripDays; default to today if in range, else first day
  useEffect(() => {
    if (tripDays.length === 0) return;
    if (activeDate && tripDays.some((d) => d.date === activeDate)) return;
    const today = new Date().toISOString().slice(0, 10);
    const todayMatch = tripDays.find((d) => d.date === today);
    const futureMatch = tripDays.find((d) => d.date >= today);
    setActiveDate(todayMatch?.date ?? futureMatch?.date ?? tripDays[0].date);
  }, [tripDays, activeDate]);

  if (!state) {
    return (
      <div className="min-h-screen bg-forest-deep text-cream flex items-center justify-center">
        <Loader2 size={20} className="animate-spin mr-2" /> Lädt …
      </div>
    );
  }

  // Onboarding gate: if active region has no dates set, show setup
  const needsSetup = !region!.startDate || !region!.endDate;

  if (needsSetup && !urlImportData) {
    return (
      <div className="min-h-screen bg-forest-gradient text-cream relative">
        <TopoBackground />
        <div className="max-w-[1100px] mx-auto relative z-10">
          <Header
            regionName={REGIONS[activeRegion!].name}
            homeBaseName={region!.homeBaseName}
            startDate={region!.startDate}
            endDate={region!.endDate}
            onEditTrip={() => {}}
          />
          <HomeBase
            name={region!.homeBaseName}
            activeRegion={activeRegion!}
            onChangeName={setHomeBaseName}
            onSwitchRegion={switchRegion}
          />
        </div>
        <RegionSetupModal
          key={activeRegion}
          initialRegion={activeRegion!}
          initialStartDate={region!.startDate}
          initialEndDate={region!.endDate}
          initialHomeBaseName={region!.homeBaseName}
          isFirstSetup={true}
          onApply={applySetup}
        />
      </div>
    );
  }

  const regionMeta = REGIONS[activeRegion!];
  const regionOffers = offersForRegion(activeRegion!);
  const allOffers = [...regionOffers, ...region!.customOffers];

  const activeDay = tripDays.find((d) => d.date === activeDate) ?? tripDays[0];
  const scheduleEntries = region!.schedule[activeDate] ?? [];
  const plannedIds = getPlannedOfferIds(scheduleEntries);
  const plannedOffers = plannedIds
    .map((id) => offerById(id, region!.customOffers))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  const allPlannedIds = Object.values(region!.schedule)
    .flat()
    .filter((e) => e.type === "offer" && e.offerId)
    .map((e) => e.offerId!);

  const allPlannedSet = new Set(allPlannedIds);
  const dismissedSet = new Set(region!.dismissed);
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
    region!.schedule,
    activeDate
  );

  const dismissedCount = region!.dismissed.length;
  const plannedCount = allPlannedSet.size;
  const counts = Object.fromEntries(tripDays.map((d) => [d.date, (region!.schedule[d.date] ?? []).length]));
  const showCardFeatures = activeRegion === "loeffingen";

  return (
    <div className="min-h-screen bg-forest-gradient text-cream relative">
      <TopoBackground />

      <div className="max-w-[1100px] mx-auto relative z-10">
        <Header
          regionName={regionMeta.name}
          homeBaseName={region!.homeBaseName}
          startDate={region!.startDate}
          endDate={region!.endDate}
          onEditTrip={() => setShowSetup(true)}
        />
        <HomeBase
          name={region!.homeBaseName}
          activeRegion={activeRegion!}
          onChangeName={setHomeBaseName}
          onSwitchRegion={switchRegion}
        />

        {/* Sticky navigation bar */}
        <nav ref={navRef} className="sticky top-0 z-30 border-b border-cream/8" style={{ backgroundColor: "var(--c-forest-deep)" }}>
          <div className="px-5 pt-2.5 pb-1.5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="font-serif italic text-[15px] text-cream">
                {activeDay.weekday}, {formatDayMonth(activeDay.date)}
              </span>
              <span className="text-[10px] text-moss-soft">
                {Object.values(counts).reduce((a, b) => a + b, 0)} geplant
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setViewMode("list")} className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${viewMode === "list" ? "bg-moss text-cream" : "text-moss-soft hover:text-cream"}`}>
                <List size={11} /> Liste
              </button>
              <button onClick={() => setViewMode("map")} className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${viewMode === "map" ? "bg-moss text-cream" : "text-moss-soft hover:text-cream"}`}>
                <Map size={11} /> Karte
              </button>
              <span className="w-px h-4 bg-cream/10 mx-0.5" />
              <button onClick={() => setShowWeek(!showWeek)} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${showWeek ? "bg-moss/80 text-cream" : "text-moss-soft hover:text-cream"}`}>
                <Calendar size={10} />
              </button>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex items-center justify-center w-6 h-6 rounded-full text-moss-soft hover:text-cream transition-colors">
                {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
              </button>
              <button onClick={() => setShowPlanManager(true)} className="text-[9px] text-moss-soft tracking-wider uppercase flex items-center gap-0.5 ml-1 hover:text-cream transition-colors" title="Plan teilen / exportieren">
                {saveStatus === "saving" && <Loader2 size={10} className="animate-spin" />}
                {saveStatus === "saved" && <Check size={10} />}
                {saveStatus === "idle" && <Save size={10} />}
              </button>
            </div>
          </div>
          <div className="px-5 pb-2.5">
            <DayStrip days={tripDays} activeDate={activeDate} counts={counts} onSelect={(date) => openDaySheet(date)} />
          </div>
        </nav>

        {showWeek && (
          <section className="px-5 py-4">
            <WeekOverview
              days={tripDays}
              schedule={region!.schedule}
              customOffers={region!.customOffers}
              onDayClick={(date) => { setShowWeek(false); openDaySheet(date); }}
            />
          </section>
        )}

        {viewMode === "list" ? (
          <section className="px-5 pb-10">
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
              <h2 className="font-serif font-light italic text-[22px] text-cream m-0 -tracking-[0.01em]">Angebote</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAddCustom(true)} className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] tracking-wider uppercase text-amber hover:text-cream bg-amber/15 hover:bg-amber/25 border border-amber/30 transition-colors">
                  <Plus size={10} /> Eigener Ort
                </button>
                {dismissedCount > 0 && (
                  <label className="flex items-center gap-1.5 text-[10px] text-moss-soft cursor-pointer">
                    <input type="checkbox" checked={hideDismissed} onChange={(e) => { setHideDismissed(e.target.checked); localStorage.setItem("hideDismissed", String(e.target.checked)); }} className="accent-amber w-3 h-3" />
                    {dismissedCount} ausgeblendet
                  </label>
                )}
                {plannedCount > 0 && (
                  <label className="flex items-center gap-1.5 text-[10px] text-moss-soft cursor-pointer">
                    <input type="checkbox" checked={hidePlanned} onChange={(e) => { setHidePlanned(e.target.checked); localStorage.setItem("hidePlanned", String(e.target.checked)); }} className="accent-amber w-3 h-3" />
                    Geplante ausblenden
                  </label>
                )}
              </div>
            </div>
            <div className="text-[11px] text-moss-soft mb-4">
              {filteredOffers.length} Vorschläge — kuratiert rund um {region!.homeBaseName}
            </div>

            <FilterBar
              filter={filter}
              maxDistance={maxDistance}
              sortKey={sortKey}
              searchQuery={searchQuery}
              showCardFilter={showCardFeatures}
              onFilterChange={setFilter}
              onDistanceChange={setMaxDistance}
              onSortChange={setSortKey}
              onSearchChange={setSearchQuery}
            />

            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
              {filteredOffers.length === 0 ? (
                <div className="col-span-full py-7 text-center text-moss-soft text-[14px] space-y-2">
                  <div className="italic">Nichts gefunden.</div>
                  <button onClick={() => { setFilter("all"); setMaxDistance(90); setSearchQuery(""); }} className="text-amber underline text-[13px]">
                    Alle Filter zurücksetzen
                  </button>
                </div>
              ) : (
                filteredOffers.map((o) => (
                  <OfferCard
                    key={o.id}
                    offer={o}
                    activeDay={activeDate}
                    days={tripDays}
                    schedule={region!.schedule}
                    isDismissed={dismissedSet.has(o.id)}
                    showCardFeatures={showCardFeatures}
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
                offers={regionOffers}
                homeBase={regionMeta.homeBase}
                mapCenter={regionMeta.mapCenter}
                mapZoom={regionMeta.mapZoom}
                plannedOfferIds={allPlannedIds}
                activeDayOfferIds={plannedIds}
              />
            </Suspense>
          </section>
        )}

        <Footer onReset={resetAll} onShare={() => setShowPlanManager(true)} />
      </div>

      {modalOffer && (
        <OfferModal
          offer={modalOffer}
          activeDay={activeDate}
          days={tripDays}
          schedule={region!.schedule}
          isDismissed={dismissedSet.has(modalOffer.id)}
          showCardFeatures={showCardFeatures}
          onClose={closeModal}
          onAdd={(date) => addToDay(modalOffer.id, date)}
          onDismiss={() => dismissOffer(modalOffer.id)}
          onUndismiss={() => undismissOffer(modalOffer.id)}
        />
      )}

      {showAddCustom && <AddCustomOffer onAdd={addCustomOffer} onClose={() => setShowAddCustom(false)} />}

      <BottomSheet
        open={showDaySheet}
        onClose={() => setShowDaySheet(false)}
        title={`${activeDay.full}, ${formatDayMonth(activeDay.date)}`}
        subtitle={`Tag ${activeDay.day} von ${tripDays.length} — ${region!.homeBaseName}`}
        badge={scheduleEntries.length > 0 ? `${scheduleEntries.length} Einträge` : "leer"}
        accent="#6a9458"
      >
        <DayDetail
          day={activeDay}
          plannedOffers={plannedOffers}
          note={region!.notes[activeDate] ?? ""}
          scheduleEntries={scheduleEntries}
          customOffers={region!.customOffers}
          highlightedId={highlightedOfferId}
          homeBase={regionMeta.homeBase}
          onRemove={(id) => removeFromDay(id, activeDate)}
          onMoveToNextDay={(() => {
            const idx = tripDays.findIndex((d) => d.date === activeDate);
            if (idx < 0 || idx >= tripDays.length - 1) return null;
            const nextDate = tripDays[idx + 1].date;
            return (offerId: string) => { removeFromDay(offerId, activeDate); addToDay(offerId, nextDate); };
          })()}
          onNoteChange={(text) => setNote(activeDate, text)}
          onAddBreak={(breakType, label) => addBreak(activeDate, breakType, label)}
          onRemoveEntry={(entryId) => removeEntry(activeDate, entryId)}
          onHighlight={setHighlightedOfferId}
          onOpenDetail={(offerId) => {
            setShowDaySheet(false);
            const found = allOffers.find((o) => o.id === offerId);
            if (found) openModal(found);
          }}
          onUpdateEntryTime={(entryId, start, end) => updateEntryTime(activeDate, entryId, start, end)}
        />
      </BottomSheet>

      {showPlanManager && (
        <PlanManager
          regionId={activeRegion!}
          region={region!}
          days={tripDays}
          customOffers={region!.customOffers}
          onApply={(merged) => {
            updateRegion(() => merged);
            setShowPlanManager(false);
          }}
          onClose={() => setShowPlanManager(false)}
        />
      )}

      {showSetup && (
        <RegionSetupModal
          initialRegion={activeRegion!}
          initialStartDate={region!.startDate}
          initialEndDate={region!.endDate}
          initialHomeBaseName={region!.homeBaseName}
          isFirstSetup={false}
          onApply={applySetup}
          onClose={() => setShowSetup(false)}
        />
      )}

      {urlImportData && (
        <UrlImportDialog
          data={urlImportData}
          currentRegionId={activeRegion!}
          currentRegion={region!}
          onAccept={(target) => {
            const data = urlImportData;
            setState((s) => {
              if (!s) return s;
              const targetRegion = s.regions[target];
              const newSchedule = { ...targetRegion.schedule };
              for (const [date, offerIds] of Object.entries(data.schedule)) {
                const existing = [...(newSchedule[date] ?? [])];
                const existingSet = new Set(existing.filter((e) => e.type === "offer").map((e) => e.offerId));
                for (const offerId of offerIds) {
                  if (!existingSet.has(offerId)) {
                    existing.push({ id: `entry-url-${Date.now()}-${Math.random()}`, type: "offer", offerId });
                  }
                }
                newSchedule[date] = existing;
              }
              return {
                ...s,
                activeRegion: target,
                regions: {
                  ...s.regions,
                  [target]: {
                    ...targetRegion,
                    schedule: newSchedule,
                    dismissed: [...new Set([...targetRegion.dismissed, ...data.dismissed])],
                    homeBaseName: data.homeBaseName || targetRegion.homeBaseName,
                    startDate: data.startDate ?? targetRegion.startDate,
                    endDate: data.endDate ?? targetRegion.endDate,
                  },
                },
              };
            });
            setActiveDate("");
            setUrlImportData(null);
          }}
          onDismiss={() => setUrlImportData(null)}
        />
      )}

      {undoAction && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[60] bg-ink text-cream px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-[13px] max-w-[90vw]">
          <span>{undoAction.label}</span>
          <button onClick={undoAction.undo} className="text-amber font-semibold hover:text-cream transition-colors whitespace-nowrap">Rückgängig</button>
          <button onClick={() => setUndoAction(null)} className="text-cream/50 hover:text-cream ml-1"><X size={14} /></button>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
}

function UrlImportDialog({
  data,
  currentRegionId,
  currentRegion,
  onAccept,
  onDismiss,
}: {
  data: SharedPlan;
  currentRegionId: RegionId;
  currentRegion: RegionState;
  onAccept: (targetRegion: RegionId) => void;
  onDismiss: () => void;
}) {
  const targetRegion: RegionId = (data.regionId as RegionId) ?? currentRegionId;
  const regionChanges = targetRegion !== currentRegionId;
  const dateChanges =
    (data.startDate && data.startDate !== currentRegion.startDate) ||
    (data.endDate && data.endDate !== currentRegion.endDate);

  const offersByDate = Object.entries(data.schedule);
  const allIds = offersByDate.flatMap(([, ids]) => ids);

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4" onClick={onDismiss}>
      <div className="bg-parchment rounded-xl w-full max-w-[480px] p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-serif font-medium text-[22px] text-ink mb-2">Plan empfangen</h2>
        <p className="text-[13px] text-stone mb-3">
          Geteilter Plan mit {allIds.length} Aktivität{allIds.length === 1 ? "" : "en"}.
        </p>

        {(regionChanges || dateChanges) && (
          <div className="mb-4 px-3 py-2.5 bg-amber/10 border border-amber/30 rounded-md text-[12px] text-ink space-y-1">
            {regionChanges && (
              <div>
                Region: <strong>{REGIONS[targetRegion].name}</strong> (aktuell: {REGIONS[currentRegionId].name})
              </div>
            )}
            {data.startDate && data.endDate && (
              <div>
                Zeitraum: <strong>{formatDayMonth(data.startDate)} – {formatDayMonth(data.endDate)}</strong>
              </div>
            )}
            {data.homeBaseName && (
              <div>
                Unterkunft: <strong>{data.homeBaseName}</strong>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto">
          {offersByDate.map(([date, ids]) => (
            <div key={date} className="bg-ink/5 rounded-lg p-3">
              <div className="text-[12px] font-medium text-ink mb-1">{formatDayMonth(date)}</div>
              {ids.map((id) => {
                const offer = offerById(id, currentRegion.customOffers);
                return (
                  <div key={id} className="text-[12px] text-ink">+ {offer?.name ?? id}</div>
                );
              })}
            </div>
          ))}
        </div>

        {data.dismissed.length > 0 && (
          <div className="text-[12px] text-stone mb-3">
            Außerdem als „nicht interessant" markiert: {data.dismissed.length} Angebote
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onAccept(targetRegion)}
            className="flex-1 py-3 bg-moss text-cream rounded-lg text-[13px] font-medium hover:bg-moss/80"
          >
            Übernehmen
          </button>
          <button onClick={onDismiss} className="py-3 px-5 bg-stone/15 text-ink rounded-lg text-[13px] font-medium hover:bg-stone/25">
            Verwerfen
          </button>
        </div>
      </div>
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
