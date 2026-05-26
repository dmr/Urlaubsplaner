import { TripDay } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

interface DayStripProps {
  days: TripDay[];
  activeDate: string;
  counts: Record<string, number>;
  onSelect: (date: string) => void;
}

export default function DayStrip({
  days,
  activeDate,
  counts,
  onSelect,
}: DayStripProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
      {days.map((d) => (
        <DayTab
          key={d.date}
          day={d}
          active={d.date === activeDate}
          isPast={d.date < today}
          isToday={d.date === today}
          count={counts[d.date] ?? 0}
          onClick={() => onSelect(d.date)}
        />
      ))}
    </div>
  );
}

interface DayTabProps {
  day: TripDay;
  active: boolean;
  isPast: boolean;
  isToday: boolean;
  count: number;
  onClick: () => void;
}

function DayTab({ day, active, isPast, isToday, count, onClick }: DayTabProps) {
  const dateNum = new Date(day.date).getDate();
  const base =
    "flex-1 min-w-[80px] py-3 px-2 rounded-sm cursor-pointer text-left relative transition-all duration-150";

  let cls: string;
  if (active) {
    cls = `${base} border-[1.5px] border-cream bg-cream text-forest`;
  } else if (isPast) {
    cls = `${base} border border-cream/10 bg-transparent text-cream/30 opacity-50`;
  } else {
    cls = `${base} border border-cream/20 bg-transparent text-cream hover:bg-cream/5`;
  }

  return (
    <button onClick={onClick} className={cls}>
      <div className="text-[10px] tracking-[0.15em] uppercase opacity-70 flex items-center gap-1">
        {day.weekday}
        {isToday && (
          <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-forest" : "bg-amber"}`} />
        )}
      </div>
      <div className="font-serif text-[26px] font-light leading-none mt-1">
        {dateNum}
      </div>
      <div className="text-[10px] mt-1 opacity-75">
        {count === 0 ? "—" : `${count} ${count === 1 ? "Plan" : "Pläne"}`}
      </div>
      {day.holiday && (
        <div className="absolute top-1 right-1">
          <AlertTriangle
            size={11}
            className={active ? "text-blood" : "text-rust"}
          />
        </div>
      )}
    </button>
  );
}
