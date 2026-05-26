import { ScheduleEntry, Offer } from "@/lib/types";
import { TRIP_DAYS } from "@/data/tripDays";
import { offerById, hikeById } from "@/lib/helpers";
import { AlertTriangle } from "lucide-react";

const BREAK_LABELS: Record<string, string> = {
  breakfast: "Frühstück",
  lunch: "Mittagessen",
  dinner: "Abendessen",
  snack: "Snack",
  pause: "Pause",
};

export default function WeekOverview({
  schedule,
  customOffers,
  onDayClick,
}: {
  schedule: Record<string, ScheduleEntry[]>;
  customOffers: Offer[];
  onDayClick: (date: string) => void;
}) {
  return (
    <div className="bg-cream/[0.04] border border-cream/15 rounded-sm p-4 overflow-x-auto">
      <h3 className="font-serif font-light italic text-[18px] text-cream mb-3">
        Wochenübersicht
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 min-w-0">
        {TRIP_DAYS.map((day) => {
          const entries = schedule[day.date] ?? [];
          return (
            <button
              key={day.date}
              onClick={() => onDayClick(day.date)}
              className="text-left p-3 rounded-md bg-forest-deep/60 border border-moss/15 hover:border-moss/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] tracking-wider uppercase text-moss-soft">
                  {day.weekday} {new Date(day.date).getDate()}.
                </span>
                {day.holiday && (
                  <AlertTriangle size={10} className="text-rust" />
                )}
              </div>
              {entries.length === 0 ? (
                <div className="text-[11px] text-moss-soft/50 italic">
                  Frei
                </div>
              ) : (
                <div className="space-y-1">
                  {entries.map((entry) => {
                    const isBreak = entry.type === "break";
                    const isHike = entry.type === "hike";
                    const offer = entry.type === "offer" && entry.offerId
                      ? offerById(entry.offerId, customOffers)
                      : null;
                    const hike = isHike && entry.hikeId ? hikeById(entry.hikeId) : null;
                    const name = isBreak
                      ? entry.label || BREAK_LABELS[entry.breakType || "pause"]
                      : isHike
                      ? `🥾 ${hike?.name || "?"}`
                      : offer?.name || "?";
                    const time = entry.startTime
                      ? `${entry.startTime} `
                      : "";

                    return (
                      <div
                        key={entry.id}
                        className={`text-[10px] leading-snug truncate ${
                          isBreak ? "text-amber/80" : "text-cream/80"
                        }`}
                      >
                        {time && (
                          <span className="text-moss-soft">{time}</span>
                        )}
                        {name}
                      </div>
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
