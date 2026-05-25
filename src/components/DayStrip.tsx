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
  return (
    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
      {days.map((d) => (
        <DayTab
          key={d.date}
          day={d}
          active={d.date === activeDate}
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
  count: number;
  onClick: () => void;
}

function DayTab({ day, active, count, onClick }: DayTabProps) {
  const dateNum = new Date(day.date).getDate();
  const base =
    "flex-1 min-w-[90px] py-3.5 px-2 rounded-sm cursor-pointer text-left relative transition-all duration-150";
  const cls = active
    ? `${base} border-[1.5px] border-cream bg-cream text-forest`
    : `${base} border border-cream/20 bg-transparent text-cream hover:bg-cream/5`;

  return (
    <button onClick={onClick} className={cls}>
      <div className="text-[10px] tracking-[0.15em] uppercase opacity-70">
        {day.weekday}
      </div>
      <div className="font-serif text-[28px] font-light leading-none mt-1">
        {dateNum}
      </div>
      <div className="text-[10px] mt-1.5 opacity-75">
        {count === 0 ? "—" : count === 1 ? "1 Plan" : `${count} Pläne`}
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
