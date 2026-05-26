import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { Offer, TripDay, ScheduleEntry, BreakType } from "@/lib/types";
import { formatDayMonth, hikeById } from "@/lib/helpers";
import {
  AlertTriangle,
  StickyNote,
  List,
  Clock,
  Plus,
  Coffee,
  Mountain,
  Loader2,
} from "lucide-react";
import PlannedItem from "./PlannedItem";
import DayTimeline from "./DayTimeline";
import { BREAK_META } from "@/lib/constants";

const DayMap = lazy(() => import("./DayMap"));

type DayViewMode = "list" | "timeline";

const BREAK_OPTIONS = Object.entries(BREAK_META).map(([type, meta]) => ({
  type: type as BreakType,
  icon: meta.icon,
}));

interface DayDetailProps {
  day: TripDay;
  plannedOffers: Offer[];
  note: string;
  scheduleEntries: ScheduleEntry[];
  customOffers: Offer[];
  onRemove: (offerId: string) => void;
  onNoteChange: (text: string) => void;
  onAddBreak: (breakType: BreakType, label?: string) => void;
  onRemoveEntry: (entryId: string) => void;
  onUpdateEntryTime: (
    entryId: string,
    startTime: string,
    endTime: string
  ) => void;
}

export default function DayDetail({
  day,
  plannedOffers,
  note,
  scheduleEntries,
  customOffers,
  onRemove,
  onNoteChange,
  onAddBreak,
  onRemoveEntry,
  onUpdateEntryTime,
}: DayDetailProps) {
  const [dayView, setDayView] = useState<DayViewMode>("list");
  const [showBreakMenu, setShowBreakMenu] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showBreakMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowBreakMenu(false);
        setAddingCustom(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showBreakMenu]);

  const hasAnyTimes = scheduleEntries.some((e) => e.startTime && e.endTime);

  return (
    <div className="bg-cream/[0.04] border border-cream/15 rounded-sm p-5">
      <div className="flex justify-between items-baseline flex-wrap gap-2">
        <div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-moss-soft">
            Tag {day.day} von 7
          </div>
          <h3 className="font-serif font-light italic text-[30px] mt-1 mb-0 text-cream tracking-tight">
            {day.full}, {formatDayMonth(day.date)}
          </h3>
        </div>
        {day.holiday && (
          <div className="px-2.5 py-1.5 bg-rust/25 border border-rust/40 rounded-sm text-[11px] text-cream flex items-center gap-1.5">
            <AlertTriangle size={12} /> {day.holiday}
          </div>
        )}
      </div>

      {/* View toggle + Add break */}
      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDayView("list")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
              dayView === "list"
                ? "bg-moss/80 text-cream"
                : "bg-stone/30 text-moss-soft hover:text-cream"
            }`}
          >
            <List size={12} /> Liste
          </button>
          <button
            onClick={() => setDayView("timeline")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
              dayView === "timeline"
                ? "bg-moss/80 text-cream"
                : "bg-stone/30 text-moss-soft hover:text-cream"
            }`}
          >
            <Clock size={12} /> Zeitleiste
          </button>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowBreakMenu(!showBreakMenu)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium bg-amber/20 text-amber hover:bg-amber/30 transition-colors"
          >
            <Plus size={12} /> Essen / Pause
          </button>

          {showBreakMenu && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-forest border border-moss/30 rounded-lg shadow-xl p-2 min-w-[180px]">
              {BREAK_OPTIONS.map(({ type, icon: Icon }) => {
                const meta = BREAK_META[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      onAddBreak(type);
                      setShowBreakMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[12px] text-cream hover:bg-moss/20 transition-colors text-left"
                  >
                    <Icon size={14} style={{ color: meta.color }} />
                    {meta.label}
                  </button>
                );
              })}
              <div className="border-t border-moss/20 mt-1 pt-1">
                {!addingCustom ? (
                  <button
                    onClick={() => setAddingCustom(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[12px] text-moss-soft hover:text-cream hover:bg-moss/20 transition-colors text-left"
                  >
                    <Plus size={14} /> Eigener Eintrag …
                  </button>
                ) : (
                  <div className="px-2 py-1">
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customLabel.trim()) {
                          onAddBreak("pause", customLabel.trim());
                          setCustomLabel("");
                          setAddingCustom(false);
                          setShowBreakMenu(false);
                        }
                      }}
                      placeholder="z.B. Eisdiele, Spielplatz …"
                      autoFocus
                      className="w-full bg-forest-deep border border-moss/30 rounded px-2 py-1.5 text-[11px] text-cream placeholder:text-moss-soft/60 outline-none focus:border-amber/50"
                    />
                    <button
                      onClick={() => {
                        if (customLabel.trim()) {
                          onAddBreak("pause", customLabel.trim());
                          setCustomLabel("");
                          setAddingCustom(false);
                          setShowBreakMenu(false);
                        }
                      }}
                      className="mt-1 w-full bg-amber/20 text-amber text-[11px] rounded px-2 py-1 hover:bg-amber/30"
                    >
                      Hinzufügen
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List view */}
      {dayView === "list" && (
        <div className="mt-4 flex flex-col gap-2">
          {scheduleEntries.length === 0 ? (
            <div className="py-8 px-5 text-center text-moss-soft text-sm italic border border-dashed border-cream/20 rounded-sm">
              Noch nichts geplant — wähle unten ein Angebot aus oder füge eine
              Pause hinzu.
            </div>
          ) : (
            scheduleEntries.map((entry) => {
              if (entry.type === "offer" && entry.offerId) {
                const offer = plannedOffers.find(
                  (o) => o.id === entry.offerId
                );
                if (!offer) return null;
                return (
                  <PlannedItem
                    key={entry.id}
                    offer={offer}
                    startTime={entry.startTime}
                    endTime={entry.endTime}
                    onRemove={() => {
                      onRemove(entry.offerId!);
                    }}
                    onUpdateTime={(start, end) =>
                      onUpdateEntryTime(entry.id, start, end)
                    }
                  />
                );
              }
              if (entry.type === "hike" && entry.hikeId) {
                const hike = hikeById(entry.hikeId);
                if (!hike) return null;
                return (
                  <HikeItem
                    key={entry.id}
                    hike={hike}
                    startTime={entry.startTime}
                    endTime={entry.endTime}
                    onRemove={() => onRemoveEntry(entry.id)}
                    onUpdateTime={(start, end) =>
                      onUpdateEntryTime(entry.id, start, end)
                    }
                  />
                );
              }
              if (entry.type === "break") {
                const meta = BREAK_META[entry.breakType || "pause"];
                const Icon = meta.icon;
                return (
                  <BreakItem
                    key={entry.id}
                    entry={entry}
                    meta={meta}
                    Icon={Icon}
                    onRemove={() => onRemoveEntry(entry.id)}
                    onUpdateTime={(start, end) =>
                      onUpdateEntryTime(entry.id, start, end)
                    }
                  />
                );
              }
              return null;
            })
          )}
        </div>
      )}

      {/* Timeline view */}
      {dayView === "timeline" && (
        <DayTimeline
          entries={scheduleEntries}
          customOffers={customOffers}
          onRemove={(entryId) => {
            const entry = scheduleEntries.find((e) => e.id === entryId);
            if (entry?.type === "offer" && entry.offerId) {
              onRemove(entry.offerId);
            } else {
              onRemoveEntry(entryId);
            }
          }}
          onUpdateTime={onUpdateEntryTime}
        />
      )}

      {!hasAnyTimes && dayView === "timeline" && scheduleEntries.length > 0 && (
        <div className="mt-2 text-[11px] text-moss-soft italic text-center">
          Tipp: Zeiten in der Liste unten setzen, damit Einträge auf der Zeitleiste erscheinen.
        </div>
      )}

      <div className="mt-4">
        <label className="text-[10px] tracking-[0.18em] uppercase text-moss-soft flex items-center gap-1">
          <StickyNote size={11} /> Notiz für den Tag
        </label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Reservierung um 19 Uhr · Brotzeit einpacken · Schwimmsachen ins Auto …"
          rows={2}
          className="mt-1.5 w-full bg-parchment border-none rounded-sm px-3 py-2.5 text-[13px] text-ink resize-y outline-none focus:ring-2 focus:ring-amber/40"
        />
      </div>

      {/* Day Map */}
      {scheduleEntries.some((e) => e.type === "offer" || e.type === "hike") && (
        <Suspense fallback={<div className="mt-4 py-4 text-center text-moss-soft text-[11px]"><Loader2 size={14} className="animate-spin inline mr-1" />Karte …</div>}>
          <DayMap entries={scheduleEntries} customOffers={customOffers} />
        </Suspense>
      )}
    </div>
  );
}

function BreakItem({
  entry,
  meta,
  Icon,
  onRemove,
  onUpdateTime,
}: {
  entry: ScheduleEntry;
  meta: { label: string; color: string };
  Icon: typeof Coffee;
  onRemove: () => void;
  onUpdateTime: (start: string, end: string) => void;
}) {
  return (
    <div
      className="bg-parchment p-4 rounded-sm border-l-[3px] flex justify-between gap-3 items-center"
      style={{ borderColor: meta.color }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon size={16} style={{ color: meta.color }} className="shrink-0" />
        <span className="font-serif text-lg font-medium text-ink leading-tight">
          {entry.label || meta.label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="time"
          value={entry.startTime || ""}
          onChange={(e) => onUpdateTime(e.target.value, entry.endTime || "")}
          className="bg-cream-soft border border-stone/20 rounded px-1.5 py-1 text-[11px] text-ink w-[72px]"
        />
        <span className="text-stone text-[11px]">–</span>
        <input
          type="time"
          value={entry.endTime || ""}
          onChange={(e) => onUpdateTime(entry.startTime || "", e.target.value)}
          className="bg-cream-soft border border-stone/20 rounded px-1.5 py-1 text-[11px] text-ink w-[72px]"
        />
      </div>
      <button
        onClick={onRemove}
        aria-label="Entfernen"
        className="bg-transparent border border-ink/20 text-ink w-8 h-8 rounded-sm cursor-pointer flex items-center justify-center shrink-0 hover:bg-ink/5"
      >
        <span className="text-[14px]">×</span>
      </button>
    </div>
  );
}

function HikeItem({
  hike,
  startTime,
  endTime,
  onRemove,
  onUpdateTime,
}: {
  hike: { name: string; difficulty: string; distance: string; duration: string; elevation: string };
  startTime?: string;
  endTime?: string;
  onRemove: () => void;
  onUpdateTime: (start: string, end: string) => void;
}) {
  const diffColor = hike.difficulty === "leicht" ? "#5a7f4b" : hike.difficulty === "mittel" ? "#c98a3a" : "#7d1f1f";
  return (
    <div className="bg-parchment p-4 rounded-sm border-l-[3px] flex justify-between gap-3 items-start" style={{ borderColor: diffColor }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Mountain size={14} style={{ color: diffColor }} className="shrink-0" />
          <span className="font-serif text-lg font-medium text-ink leading-tight">{hike.name}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: diffColor + "25", color: diffColor }}>
            {hike.difficulty}
          </span>
        </div>
        <div className="text-xs text-stone mt-1 flex flex-wrap gap-3">
          <span>{hike.distance}</span>
          <span>{hike.duration}</span>
          <span>{hike.elevation}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <input type="time" value={startTime || ""} onChange={(e) => onUpdateTime(e.target.value, endTime || "")} className="bg-cream-soft border border-stone/20 rounded px-1.5 py-1 text-[11px] text-ink w-[72px]" />
          <span className="text-stone text-[11px]">–</span>
          <input type="time" value={endTime || ""} onChange={(e) => onUpdateTime(startTime || "", e.target.value)} className="bg-cream-soft border border-stone/20 rounded px-1.5 py-1 text-[11px] text-ink w-[72px]" />
        </div>
      </div>
      <button onClick={onRemove} aria-label="Entfernen" className="bg-transparent border border-ink/20 text-ink w-8 h-8 rounded-sm cursor-pointer flex items-center justify-center shrink-0 hover:bg-ink/5">
        <span className="text-[14px]">×</span>
      </button>
    </div>
  );
}

