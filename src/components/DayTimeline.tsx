import { ScheduleEntry } from "@/lib/types";
import { offerById } from "@/lib/helpers";
import { BREAK_META } from "@/lib/constants";
import { X } from "lucide-react";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

interface DayTimelineProps {
  entries: ScheduleEntry[];
  customOffers: import("@/lib/types").Offer[];
  onRemove: (entryId: string) => void;
  onUpdateTime: (entryId: string, startTime: string, endTime: string) => void;
}

export default function DayTimeline({
  entries,
  customOffers,
  onRemove,
  onUpdateTime,
}: DayTimelineProps) {
  const startMinutes = 7 * 60;
  const endMinutes = 22 * 60;
  const totalMinutes = endMinutes - startMinutes;

  const timedEntries = entries
    .filter((e) => e.startTime && e.endTime)
    .sort((a, b) => timeToMinutes(a.startTime!) - timeToMinutes(b.startTime!));

  const untimedEntries = entries.filter((e) => !e.startTime || !e.endTime);

  return (
    <div className="mt-4">
      {/* Hour labels */}
      <div className="relative h-6 mb-1">
        {HOURS.map((h) => {
          const pct = ((h * 60 - startMinutes) / totalMinutes) * 100;
          return (
            <span
              key={h}
              className="absolute text-[10px] text-moss-soft -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              {h}
            </span>
          );
        })}
      </div>

      {/* Timeline track */}
      <div className="relative bg-forest-deep/60 border border-moss/20 rounded-lg min-h-[60px]">
        {HOURS.map((h) => {
          const pct = ((h * 60 - startMinutes) / totalMinutes) * 100;
          return (
            <div
              key={h}
              className="absolute top-0 bottom-0 w-px bg-moss/10"
              style={{ left: `${pct}%` }}
            />
          );
        })}

        {timedEntries.length === 0 && untimedEntries.length === 0 ? (
          <div className="py-6 text-center text-moss-soft text-[12px] italic">
            Keine Einträge — füge Angebote oder Pausen hinzu.
          </div>
        ) : timedEntries.length === 0 ? (
          <div className="py-6 text-center text-moss-soft text-[12px] italic">
            Zeiten setzen, um Einträge hier zu sehen.
          </div>
        ) : (
          <div className="relative py-2 px-1 space-y-1">
            {timedEntries.map((entry) => {
              const start = timeToMinutes(entry.startTime!);
              const end = timeToMinutes(entry.endTime!);
              const left = ((start - startMinutes) / totalMinutes) * 100;
              const width = ((end - start) / totalMinutes) * 100;

              const isBreak = entry.type === "break";
              const breakMeta = isBreak
                ? BREAK_META[entry.breakType || "pause"]
                : null;
              const offer =
                entry.type === "offer" && entry.offerId
                  ? offerById(entry.offerId, customOffers)
                  : null;

              const bgColor = isBreak
                ? breakMeta!.color + "35"
                : offer?.cardIncluded
                ? "#c98a3a25"
                : "#5a7f4b25";
              const borderColor = isBreak
                ? breakMeta!.color
                : offer?.cardIncluded
                ? "#c98a3a"
                : "#5a7f4b";

              const Icon = isBreak ? breakMeta!.icon : null;

              return (
                <div
                  key={entry.id}
                  className="relative rounded-md border-l-[3px] px-2 py-1.5 flex items-center gap-1.5 group cursor-default"
                  style={{
                    marginLeft: `${left}%`,
                    width: `${Math.max(width, 8)}%`,
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                  }}
                >
                  {Icon && <Icon size={12} style={{ color: borderColor }} />}
                  <span className="text-[11px] text-cream truncate flex-1">
                    {isBreak
                      ? entry.label || breakMeta!.label
                      : offer?.name || "?"}
                  </span>
                  <span className="text-[9px] text-moss-soft shrink-0 hidden sm:inline">
                    {entry.startTime}–{entry.endTime}
                  </span>
                  <button
                    onClick={() => onRemove(entry.id)}
                    className="opacity-0 group-hover:opacity-100 bg-transparent text-moss-soft hover:text-cream p-0.5 transition-opacity"
                    aria-label="Entfernen"
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Un-timed entries below */}
      {untimedEntries.length > 0 && (
        <div className="mt-3 space-y-1">
          <div className="text-[10px] text-moss-soft uppercase tracking-wider">
            Ohne Uhrzeit
          </div>
          {untimedEntries.map((entry) => {
            const isBreak = entry.type === "break";
            const breakMeta = isBreak
              ? BREAK_META[entry.breakType || "pause"]
              : null;
            const offer =
              entry.type === "offer" && entry.offerId
                ? offerById(entry.offerId, customOffers)
                : null;

            return (
              <div
                key={entry.id}
                className="flex items-center gap-2 bg-forest-deep/40 rounded-md px-3 py-2 border border-moss/15"
              >
                <span className="text-[12px] text-cream flex-1 truncate">
                  {isBreak
                    ? entry.label || breakMeta!.label
                    : offer?.name || "?"}
                </span>
                <input
                  type="time"
                  value={entry.startTime || ""}
                  onChange={(e) =>
                    onUpdateTime(entry.id, e.target.value, entry.endTime || "")
                  }
                  className="bg-forest border border-moss/30 rounded px-1.5 py-0.5 text-[11px] text-cream w-[72px]"
                />
                <span className="text-moss-soft text-[11px]">–</span>
                <input
                  type="time"
                  value={entry.endTime || ""}
                  onChange={(e) =>
                    onUpdateTime(entry.id, entry.startTime || "", e.target.value)
                  }
                  className="bg-forest border border-moss/30 rounded px-1.5 py-0.5 text-[11px] text-cream w-[72px]"
                />
                <button
                  onClick={() => onRemove(entry.id)}
                  className="bg-transparent text-moss-soft hover:text-cream p-0.5"
                  aria-label="Entfernen"
                >
                  <X size={11} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
