import { MapPin, Calendar, Pencil } from "lucide-react";
import Logo from "./Logo";
import { formatDayMonth } from "@/lib/helpers";

interface HeaderProps {
  regionName: string;
  homeBaseName: string;
  startDate?: string;
  endDate?: string;
  onEditTrip: () => void;
}

function dayCount(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function durationLabel(start: string, end: string): string {
  const n = dayCount(start, end);
  if (n === 7) return "Eine Woche";
  if (n === 14) return "Zwei Wochen";
  if (n === 1) return "Ein Tag";
  return `${n} Tage`;
}

export default function Header({ regionName, homeBaseName, startDate, endDate, onEditTrip }: HeaderProps) {
  const hasDates = !!(startDate && endDate);
  const headline = hasDates ? durationLabel(startDate!, endDate!) : "Urlaubsplaner";
  const dateLabel = hasDates ? `${formatDayMonth(startDate!)} – ${formatDayMonth(endDate!)}` : "Zeitraum festlegen";

  return (
    <header className="relative px-5 pt-6 pb-4 z-10">
      <div className="flex items-center gap-3">
        <Logo size={56} />
        <div className="flex-1 min-w-0">
          <h1
            className="font-serif font-light italic text-cream m-0 leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(28px, 7vw, 48px)" }}
          >
            {headline}
            <span className="not-italic font-light"> um {homeBaseName}</span>
          </h1>
          <div className="mt-1.5 flex gap-3 flex-wrap text-[12px] text-cream-soft items-center">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {regionName}
            </span>
            <button
              onClick={onEditTrip}
              className="inline-flex items-center gap-1 hover:text-amber transition-colors cursor-pointer"
              title="Region oder Zeitraum ändern"
            >
              <Calendar size={12} /> {dateLabel}
              <Pencil size={10} className="opacity-60" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
