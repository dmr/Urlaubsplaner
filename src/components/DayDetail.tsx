import { Offer, TripDay } from "@/lib/types";
import { formatDayMonth } from "@/lib/helpers";
import { AlertTriangle, StickyNote } from "lucide-react";
import PlannedItem from "./PlannedItem";

interface DayDetailProps {
  day: TripDay;
  plannedOffers: Offer[];
  note: string;
  onRemove: (offerId: string) => void;
  onNoteChange: (text: string) => void;
}

export default function DayDetail({
  day,
  plannedOffers,
  note,
  onRemove,
  onNoteChange,
}: DayDetailProps) {
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

      <div className="mt-4 flex flex-col gap-2">
        {plannedOffers.length === 0 ? (
          <div className="py-8 px-5 text-center text-moss-soft text-sm italic border border-dashed border-cream/20 rounded-sm">
            Noch nichts geplant — wähle unten ein Angebot aus.
          </div>
        ) : (
          plannedOffers.map((o) => (
            <PlannedItem
              key={o.id}
              offer={o}
              onRemove={() => onRemove(o.id)}
            />
          ))
        )}
      </div>

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
    </div>
  );
}
