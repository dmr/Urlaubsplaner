import { useEffect, useRef, useState, useMemo, lazy, Suspense } from "react";
import { Offer, ScheduleEntry } from "@/lib/types";

const HikeMapSection = lazy(() => import("./HikeMapSection"));
import { TRIP_DAYS } from "@/data/tripDays";
import { TAG_META } from "@/data/offers";
import { ageWarning, isOfferPlannedOnDate } from "@/lib/helpers";
import { OFFER_COORDS, googleMapsDirectionsUrl } from "@/data/coords";
import { computeRanking, getRankingExplanation } from "@/lib/ranking";
import {
  X,
  MapPin,
  Clock,
  Ticket,
  AlertTriangle,
  CalendarX,
  ExternalLink,
  Navigation,
  ThumbsDown,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

interface OfferModalProps {
  offer: Offer;
  activeDay: string;
  schedule: Record<string, ScheduleEntry[]>;
  isDismissed: boolean;
  onClose: () => void;
  onAdd: (date: string) => void;
  onDismiss: () => void;
  onUndismiss: () => void;
}

export default function OfferModal({
  offer,
  activeDay,
  schedule,
  isDismissed,
  onClose,
  onAdd,
  onDismiss,
  onUndismiss,
}: OfferModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [imageIdx, setImageIdx] = useState(0);
  const ranking = useMemo(() => computeRanking(offer, schedule, activeDay), [offer.id, schedule, activeDay]);
  const explanation = useMemo(() => getRankingExplanation(ranking), [ranking]);
  const warn = ageWarning(offer);
  const images = offer.images ?? [];

  const activeDayData = TRIP_DAYS.find((d) => d.date === activeDay);
  const notAvailableToday =
    offer.availableDays &&
    activeDayData &&
    !offer.availableDays.includes(activeDayData.weekday);

  const plannedDates = TRIP_DAYS.filter((d) =>
    isOfferPlannedOnDate(schedule, offer.id, d.date)
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && images.length > 1)
        setImageIdx((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight" && images.length > 1)
        setImageIdx((i) => (i + 1) % images.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, images.length]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8"
    >
      <div className="bg-parchment rounded-lg w-full max-w-[640px] relative my-4">
        {/* Close — sticky inside scrollable modal */}
        <div className="sticky top-0 z-20 flex justify-end p-2 pointer-events-none">
          <button
            onClick={onClose}
            className="pointer-events-auto bg-ink/70 text-cream w-10 h-10 rounded-full flex items-center justify-center hover:bg-ink shadow-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image gallery */}
        {images.length > 0 && (
          <div className="relative h-[220px] sm:h-[280px] overflow-hidden rounded-t-lg bg-forest-deep">
            <img
              src={images[imageIdx]}
              alt={offer.name}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setImageIdx((i) => (i - 1 + images.length) % images.length)
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-ink/50 text-cream w-8 h-8 rounded-full flex items-center justify-center hover:bg-ink/70"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setImageIdx((i) => (i + 1) % images.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-ink/50 text-cream w-8 h-8 rounded-full flex items-center justify-center hover:bg-ink/70"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIdx(i)}
                      className={`w-2 h-2 rounded-full ${
                        i === imageIdx ? "bg-cream" : "bg-cream/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute bottom-2 right-2 text-[9px] text-cream/50">
              Wikimedia Commons
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="text-[11px] tracking-[0.15em] uppercase text-stone font-medium">
            {offer.sub}
          </div>
          <h2 className="font-serif font-medium text-[28px] leading-tight text-ink mt-1 -tracking-[0.01em]">
            {offer.name}
          </h2>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {offer.cardIncluded && (
              <span className="px-2.5 py-1 bg-amber/15 text-amber-deep border border-amber/40 rounded-sm text-[11px] font-semibold flex items-center gap-1">
                <Ticket size={11} /> Card inklusive
              </span>
            )}
            {offer.cardDiscount && (
              <span className="px-2.5 py-1 bg-amber/10 text-amber-deep border border-amber/30 rounded-sm text-[11px] flex items-center gap-1">
                <Ticket size={11} /> {offer.cardDiscount}
              </span>
            )}
            {plannedDates.length > 0 && (
              <span className="px-2.5 py-1 bg-moss/15 text-moss border border-moss/40 rounded-sm text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle size={11} /> Geplant: {plannedDates.map((d) => d.weekday).join(", ")}
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-ink/80">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="shrink-0" /> {offer.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="shrink-0" /> {offer.duration}
            </div>
            <div>Preis: {offer.price}</div>
            <div>Mindestalter: {offer.minAge === 0 ? "Alle" : `ab ${offer.minAge} J.`}</div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {offer.tags.map((t) => {
              const meta = TAG_META[t];
              return (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                  style={{
                    backgroundColor: meta.color + "22",
                    color: meta.color,
                    borderColor: meta.color + "55",
                  }}
                >
                  {meta.label}
                </span>
              );
            })}
          </div>

          {/* Warnings */}
          {notAvailableToday && (
            <div className="mt-3 px-3 py-2 bg-amber/10 border border-amber/30 rounded-sm text-[12px] text-amber-deep flex items-start gap-2">
              <CalendarX size={14} className="mt-0.5 shrink-0" />
              Nur {offer.availableDays!.join(", ")} verfügbar — heute ist {activeDayData?.weekday}.
            </div>
          )}
          {warn && (
            <div className="mt-3 px-3 py-2 bg-blood/10 border border-blood/30 rounded-sm text-[12px] text-blood flex items-start gap-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              {warn}
            </div>
          )}

          {/* Description */}
          <p className="mt-4 text-[14px] text-ink leading-relaxed">
            {offer.description}
          </p>

          {/* Pro / Con */}
          {(offer.pro || offer.con) && (
            <div className="mt-4 pt-4 border-t border-stone/20 space-y-2 text-[13px]">
              {offer.pro && (
                <div className="text-ink/80">
                  <strong className="text-moss">+ Pro: </strong>
                  {offer.pro}
                </div>
              )}
              {offer.con && (
                <div className="text-ink/80">
                  <strong className="text-rust">− Contra: </strong>
                  {offer.con}
                </div>
              )}
            </div>
          )}

          {/* Ranking */}
          <div className="mt-4 pt-4 border-t border-stone/15">
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} className="text-amber" />
              <span className="text-[13px] font-medium text-ink">
                Empfehlung: {ranking.total}/100
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {[
                { label: "Nähe", score: ranking.distanceScore, max: 25 },
                { label: "Card", score: ranking.cardScore, max: 20 },
                { label: "Familie", score: ranking.familyScore, max: 30 },
                { label: "Wetter", score: ranking.weatherScore, max: 10 },
                { label: "Vielfalt", score: ranking.varietyScore, max: 15 },
              ].map((f) => (
                <div key={f.label} className="text-center">
                  <div className="h-10 bg-ink/8 border border-stone/20 rounded-sm relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-moss rounded-sm"
                      style={{ height: `${(f.score / f.max) * 100}%`, opacity: 0.6 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-ink">
                      {Math.round(f.score)}
                    </div>
                  </div>
                  <div className="text-[10px] text-ink/70 mt-1 font-medium">{f.label}</div>
                </div>
              ))}
            </div>
            <div className="text-[12px] text-stone">
              {explanation.join(" · ")}
            </div>
          </div>

          {/* Links */}
          <div className="mt-4 flex flex-wrap gap-4">
            {offer.url && (
              <a
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] text-stone underline hover:text-ink"
              >
                <ExternalLink size={13} /> Website
              </a>
            )}
            {OFFER_COORDS[offer.id] && (
              <a
                href={googleMapsDirectionsUrl(OFFER_COORDS[offer.id][0], OFFER_COORDS[offer.id][1])}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] text-stone underline hover:text-ink"
              >
                <Navigation size={13} /> Route in Google Maps
              </a>
            )}
          </div>

          {/* Hike Details */}
          {offer.hikeDetails && (
            <div className="mt-4 pt-4 border-t border-stone/20 space-y-3">
              <h3 className="text-[14px] font-medium text-ink">Wanderung Details</h3>

              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="text-ink/70"><strong>Schwierigkeit:</strong> {offer.hikeDetails.difficulty}</div>
                <div className="text-ink/70"><strong>Höhe:</strong> {offer.hikeDetails.elevation}</div>
                <div className="text-ink/70"><strong>Untergrund:</strong> {offer.hikeDetails.surface}</div>
                <div className="text-ink/70">{offer.hikeDetails.strollerFriendly ? "✓ Buggy-tauglich" : "✗ Kein Buggy"}</div>
              </div>

              {offer.hikeDetails.elevationProfile && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone mb-1">Höhenprofil</div>
                  <div className="flex items-end gap-px h-14 bg-ink/5 rounded p-1">
                    {offer.hikeDetails.elevationProfile.waypoints.map((wp, i) => {
                      const min = Math.min(...offer.hikeDetails!.elevationProfile!.waypoints.map(w => w.elevation));
                      const range = offer.hikeDetails!.elevationProfile!.max - min;
                      const pct = range > 0 ? ((wp.elevation - min) / range) * 100 : 50;
                      return (
                        <div key={i} className="flex-1 bg-moss rounded-t-sm relative group" style={{ height: `${Math.max(pct, 8)}%` }} title={`${wp.name}: ${wp.elevation} m`}>
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-ink text-parchment text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                            {wp.elevation} m — {wp.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-stone mt-1">
                    {offer.hikeDetails.elevationProfile.start} m → {offer.hikeDetails.elevationProfile.max} m · ↑{offer.hikeDetails.elevationProfile.totalAscent} m ↓{offer.hikeDetails.elevationProfile.totalDescent} m
                  </div>
                </div>
              )}

              {offer.hikeDetails.whatToPack && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone mb-1">Einpacken</div>
                  <div className="flex flex-wrap gap-1">{offer.hikeDetails.whatToPack.map((p, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-amber/10 text-amber-deep border border-amber/20">{p}</span>)}</div>
                </div>
              )}

              {offer.hikeDetails.bestTime && (
                <div className="text-[12px] text-ink/80"><strong className="text-stone">Beste Zeit:</strong> {offer.hikeDetails.bestTime}</div>
              )}
              {offer.hikeDetails.waterSources && (
                <div className="text-[12px] text-ink/80"><strong className="text-stone">Verpflegung:</strong> {offer.hikeDetails.waterSources}</div>
              )}
              {offer.hikeDetails.shorterVariant && (
                <div className="text-[12px] text-ink/80"><strong className="text-stone">Kürzere Variante:</strong> {offer.hikeDetails.shorterVariant}</div>
              )}
              {offer.hikeDetails.emergencyInfo && (
                <div className="text-[12px] text-rust"><strong>Notfall:</strong> {offer.hikeDetails.emergencyInfo}</div>
              )}

              {offer.hikeDetails.photoSpots.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone mb-1">Foto-Spots</div>
                  <div className="space-y-2">
                    {offer.hikeDetails.photoSpots.map((spot, i) => (
                      <div key={i}>
                        {spot.image && <img src={spot.image} alt={spot.description} loading="lazy" className="w-full h-[140px] object-cover rounded mb-1" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                        <div className="text-[11px] text-ink/70">📸 {spot.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Suspense fallback={<div className="py-4 text-center text-stone text-[11px]">Karte lädt …</div>}>
                <HikeMapSection details={offer.hikeDetails} />
              </Suspense>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 pt-4 border-t border-stone/15 flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] tracking-wider uppercase text-stone mb-1.5">
                An Tag hinzufügen
              </div>
              <div className="grid grid-cols-7 gap-1">
                {TRIP_DAYS.map((d) => {
                  const already = isOfferPlannedOnDate(schedule, offer.id, d.date);
                  return (
                    <button
                      key={d.date}
                      onClick={() => !already && onAdd(d.date)}
                      disabled={already}
                      className={`py-2 rounded-sm text-[11px] font-semibold ${
                        already
                          ? "bg-stone/20 text-stone/50 cursor-not-allowed"
                          : d.date === activeDay
                          ? "bg-amber text-cream cursor-pointer hover:bg-amber-deep"
                          : "bg-forest text-cream cursor-pointer hover:bg-forest-deep"
                      }`}
                    >
                      {already ? "✓" : d.weekday}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={isDismissed ? onUndismiss : onDismiss}
              className={`self-end flex items-center gap-1.5 px-3 py-2 rounded-sm text-[11px] font-medium border transition-colors ${
                isDismissed
                  ? "bg-moss/10 text-moss border-moss/30 hover:bg-moss/20"
                  : "bg-transparent text-stone border-stone/30 hover:bg-stone/10"
              }`}
            >
              <ThumbsDown size={12} />
              {isDismissed ? "Wieder interessant" : "Nicht interessant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
