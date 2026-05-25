import { useState } from "react";
import { Offer, ScheduleEntry } from "@/lib/types";
import { TRIP_DAYS } from "@/data/tripDays";
import { TAG_META } from "@/data/offers";
import { ageWarning, isOfferPlannedOnDate } from "@/lib/helpers";
import { computeRanking, getRankingExplanation } from "@/lib/ranking";
import {
  MapPin,
  Clock,
  Ticket,
  AlertTriangle,
  CalendarX,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";

interface OfferCardProps {
  offer: Offer;
  activeDay: string;
  schedule: Record<string, ScheduleEntry[]>;
  onAdd: (date: string) => void;
}

function TagChip({ tag }: { tag: keyof typeof TAG_META }) {
  const meta = TAG_META[tag];
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full border font-medium tracking-wider uppercase"
      style={{
        backgroundColor: meta.color + "22",
        color: meta.color,
        borderColor: meta.color + "55",
      }}
    >
      {meta.label}
    </span>
  );
}

export default function OfferCard({ offer, activeDay, schedule, onAdd }: OfferCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [picking, setPicking] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const warn = ageWarning(offer);
  const ranking = computeRanking(offer, schedule, activeDay);
  const rankingExplanation = getRankingExplanation(ranking);

  const plannedDates = TRIP_DAYS
    .filter((d) => isOfferPlannedOnDate(schedule, offer.id, d.date))
    .map((d) => d.weekday);

  const activeDayData = TRIP_DAYS.find((d) => d.date === activeDay);
  const notAvailableToday = offer.availableDays &&
    activeDayData &&
    !offer.availableDays.includes(activeDayData.weekday);

  return (
    <div className="bg-parchment rounded-sm overflow-hidden flex flex-col border border-cream">
      <div className="p-4">
        <div className="flex justify-between items-start gap-2.5">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-[0.15em] uppercase text-stone/70">
              {offer.sub}
            </div>
            <h3 className="font-serif font-medium text-[22px] leading-tight text-ink mt-1 -tracking-[0.01em]">
              {offer.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {plannedDates.length > 0 && (
              <div className="px-2 py-0.5 bg-moss/15 text-moss border border-moss/40 rounded-sm text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle size={10} /> {plannedDates.join(", ")}
              </div>
            )}
            {offer.cardIncluded && (
              <div
                title="Hochschwarzwald Card inklusive"
                className="px-2 py-0.5 bg-amber/15 text-amber-deep border border-amber/40 rounded-sm text-[10px] font-semibold flex items-center gap-1"
              >
                <Ticket size={10} /> CARD
              </div>
            )}
          </div>
        </div>

        <div className="mt-2.5 flex gap-3 flex-wrap text-xs text-stone">
          <span>
            <MapPin size={11} className="inline mr-0.5" />
            {offer.location}
          </span>
          <span>
            <Clock size={11} className="inline mr-0.5" />
            {offer.duration}
          </span>
          <span>{offer.price}</span>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
          {offer.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
          <button
            onClick={() => setShowRanking(!showRanking)}
            className="text-[10px] px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20 font-medium cursor-pointer hover:bg-forest/20"
            title="Empfehlungs-Score"
          >
            {ranking.total} Pkt
          </button>
        </div>

        {showRanking && (
          <div className="mt-2 px-2.5 py-2 bg-forest/5 border border-forest/15 rounded-sm text-[10px] text-stone leading-relaxed">
            <div className="font-medium text-ink mb-1">Empfehlung: {ranking.total}/100</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              <span>Nähe ({offer.distance} km)</span><span className="text-right">{Math.round(ranking.distanceScore)}/25</span>
              <span>Card-Wert</span><span className="text-right">{ranking.cardScore}/20</span>
              <span>Familientauglich</span><span className="text-right">{ranking.familyScore}/30</span>
              <span>Wetterfest</span><span className="text-right">{ranking.weatherScore}/10</span>
              <span>Vielfalt</span><span className="text-right">{ranking.varietyScore}/15</span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-forest/10 text-[10px] text-stone/80">
              {rankingExplanation.join(" · ")}
            </div>
          </div>
        )}

        {notAvailableToday && (
          <div className="mt-2.5 px-2.5 py-2 bg-amber/10 border border-amber/30 rounded-sm text-[11px] text-amber-deep flex items-start gap-1.5">
            <CalendarX size={12} className="mt-0.5 shrink-0" />
            <span>Nur {offer.availableDays!.join(", ")} verfügbar — heute ist {activeDayData?.weekday}.</span>
          </div>
        )}

        <p className="text-[13px] text-ink leading-relaxed mt-3 mb-0">
          {offer.description}
        </p>

        {warn && (
          <div className="mt-2.5 px-2.5 py-2 bg-blood/10 border border-blood/30 rounded-sm text-[11px] text-blood flex items-start gap-1.5">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            <span>{warn}</span>
          </div>
        )}

        {expanded && (
          <div className="mt-3 pt-3 border-t border-dashed border-stone/30 text-xs text-stone leading-relaxed">
            {offer.pro && (
              <div>
                <strong className="text-moss">+ </strong>
                {offer.pro}
              </div>
            )}
            {offer.con && (
              <div className="mt-1">
                <strong className="text-rust">− </strong>
                {offer.con}
              </div>
            )}
            {offer.cardDiscount && (
              <div className="mt-1 text-amber-deep">
                <Ticket size={11} className="inline mr-0.5" />
                {offer.cardDiscount}
              </div>
            )}
            {offer.url && (
              <div className="mt-1.5">
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone underline hover:text-ink"
                >
                  Offizielle Website ↗
                </a>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2.5 bg-transparent border-none text-stone text-[11px] cursor-pointer p-0 flex items-center gap-1 tracking-wider"
        >
          {expanded ? (
            <>
              Weniger <ChevronUp size={12} />
            </>
          ) : (
            <>
              Pro / Contra <ChevronDown size={12} />
            </>
          )}
        </button>
      </div>

      <div className="px-4 pb-3.5 mt-auto">
        {!picking ? (
          <button
            onClick={() => setPicking(true)}
            className="w-full py-2.5 bg-forest text-cream rounded-sm cursor-pointer text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-1.5 hover:bg-forest-deep"
          >
            <Plus size={14} /> An Tag hinzufügen
          </button>
        ) : (
          <div>
            <div className="text-[10px] tracking-wider uppercase text-stone mb-1.5">
              An welchen Tag?
            </div>
            <div className="grid grid-cols-7 gap-1">
              {TRIP_DAYS.map((d) => {
                const alreadyPlanned = isOfferPlannedOnDate(schedule, offer.id, d.date);
                return (
                  <button
                    key={d.date}
                    onClick={() => {
                      if (!alreadyPlanned) {
                        onAdd(d.date);
                      }
                      setPicking(false);
                    }}
                    disabled={alreadyPlanned}
                    className={`py-2 rounded-sm text-[11px] font-semibold ${
                      alreadyPlanned
                        ? "bg-stone/30 text-stone/60 cursor-not-allowed"
                        : d.date === activeDay
                        ? "bg-amber text-cream cursor-pointer"
                        : "bg-forest hover:bg-forest-deep text-cream cursor-pointer"
                    }`}
                  >
                    {alreadyPlanned ? "✓" : d.weekday}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPicking(false)}
              className="mt-1.5 bg-transparent border-none text-stone text-[11px] cursor-pointer"
            >
              Abbrechen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
