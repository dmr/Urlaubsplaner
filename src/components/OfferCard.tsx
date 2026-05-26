import { Offer, ScheduleEntry } from "@/lib/types";
import { TRIP_DAYS } from "@/data/tripDays";
import { TAG_META } from "@/data/offers";
import { ageWarning, isOfferPlannedOnDate } from "@/lib/helpers";
import {
  MapPin,
  Clock,
  Ticket,
  AlertTriangle,
  CalendarX,
  CheckCircle,
  ThumbsDown,
} from "lucide-react";

interface OfferCardProps {
  offer: Offer;
  activeDay: string;
  schedule: Record<string, ScheduleEntry[]>;
  isDismissed: boolean;
  onOpenDetail: () => void;
}

export default function OfferCard({
  offer,
  activeDay,
  schedule,
  isDismissed,
  onOpenDetail,
}: OfferCardProps) {
  const warn = ageWarning(offer);
  const images = offer.images ?? [];

  const plannedDates = TRIP_DAYS
    .filter((d) => isOfferPlannedOnDate(schedule, offer.id, d.date))
    .map((d) => d.weekday);

  const activeDayData = TRIP_DAYS.find((d) => d.date === activeDay);
  const notAvailableToday =
    offer.availableDays &&
    activeDayData &&
    !offer.availableDays.includes(activeDayData.weekday);

  return (
    <div
      onClick={onOpenDetail}
      className={`bg-parchment rounded-sm overflow-hidden flex flex-col border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        isDismissed
          ? "border-stone/30 opacity-50"
          : "border-cream hover:border-amber/40"
      }`}
    >
      {/* Thumbnail */}
      {images.length > 0 && (
        <div className="h-[140px] overflow-hidden bg-forest-deep">
          <img
            src={images[0]}
            alt={offer.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement!.style.display = "none";
            }}
          />
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-[0.15em] uppercase text-stone">
              {offer.sub}
            </div>
            <h3 className="font-serif font-medium text-[20px] leading-tight text-ink mt-1 -tracking-[0.01em]">
              {offer.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isDismissed && (
              <ThumbsDown size={12} className="text-stone/40" />
            )}
            {plannedDates.length > 0 && (
              <span className="px-1.5 py-0.5 bg-moss/15 text-moss border border-moss/40 rounded-sm text-[9px] font-semibold flex items-center gap-0.5">
                <CheckCircle size={9} /> {plannedDates.join(",")}
              </span>
            )}
            {offer.cardIncluded && (
              <span className="px-1.5 py-0.5 bg-amber/15 text-amber-deep border border-amber/40 rounded-sm text-[9px] font-semibold flex items-center gap-0.5">
                <Ticket size={9} /> CARD
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 flex gap-3 flex-wrap text-[13px] text-ink/80">
          <span>
            <MapPin size={11} className="inline mr-0.5" />
            {offer.distance} km
          </span>
          <span>
            <Clock size={11} className="inline mr-0.5" />
            {offer.duration}
          </span>
          <span>{offer.price}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {offer.tags.slice(0, 3).map((t) => {
            const meta = TAG_META[t];
            return (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                style={{
                  backgroundColor: meta.color + "18",
                  color: meta.color,
                  borderColor: meta.color + "40",
                }}
              >
                {meta.label}
              </span>
            );
          })}
          {offer.tags.length > 3 && (
            <span className="text-[9px] text-stone/60">+{offer.tags.length - 3}</span>
          )}
        </div>

        <p className="text-[13px] text-ink leading-relaxed mt-2 mb-0 line-clamp-2 flex-1">
          {offer.description}
        </p>

        {notAvailableToday && (
          <div className="mt-2 text-[10px] text-amber-deep flex items-center gap-1">
            <CalendarX size={10} /> Nur {offer.availableDays!.join(", ")}
          </div>
        )}
        {warn && !notAvailableToday && (
          <div className="mt-2 text-[10px] text-blood flex items-center gap-1">
            <AlertTriangle size={10} /> {warn.slice(0, 60)}…
          </div>
        )}

        <div className="mt-3 pt-2 border-t border-stone/20 text-[10px] text-stone text-center">
          Tippen für Details
        </div>
      </div>
    </div>
  );
}
