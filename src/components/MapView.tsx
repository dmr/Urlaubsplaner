import { useEffect, useRef, useState } from "react";
import { MapPin, Route } from "lucide-react";
import type { Offer } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DIFFICULTY_COLORS: Record<string, string> = {
  leicht: "#5a7f4b",
  mittel: "#c98a3a",
  schwer: "#7d1f1f",
};

interface MapViewProps {
  offers: Offer[];
  homeBase: { name: string; lat: number; lng: number };
  mapCenter: [number, number];
  mapZoom: number;
  plannedOfferIds: string[];
  activeDayOfferIds?: string[];
}

export default function MapView({
  offers,
  homeBase,
  mapCenter,
  mapZoom,
  plannedOfferIds,
  activeDayOfferIds = [],
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);
  const [showOffers, setShowOffers] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, { center: mapCenter, zoom: mapZoom, zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 17,
    }).addTo(map);

    layerGroup.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      layerGroup.current = null;
    };
  }, []);

  // Re-center when region changes
  useEffect(() => {
    mapInstance.current?.setView(mapCenter, mapZoom);
  }, [mapCenter[0], mapCenter[1], mapZoom]);

  useEffect(() => {
    const map = mapInstance.current;
    const lg = layerGroup.current;
    if (!map || !lg) return;
    lg.clearLayers();

    // Home base marker
    L.circleMarker([homeBase.lat, homeBase.lng], {
      radius: 6, fillColor: "#f3ead7", color: "#162820", weight: 2, fillOpacity: 1,
    }).addTo(lg).bindPopup(`<b>${homeBase.name}</b> (Unterkunft)`);

    offers.forEach((offer) => {
      const isHike = !!offer.hikeDetails;

      if (isHike && showRoutes && offer.hikeDetails!.path.length > 1) {
        const color = DIFFICULTY_COLORS[offer.hikeDetails!.difficulty] || "#5a7f4b";
        L.polyline(offer.hikeDetails!.path, {
          color, weight: 3.5, opacity: 0.85,
          dashArray: offer.hikeDetails!.difficulty === "schwer" ? "8 5" : undefined,
        }).addTo(lg).bindPopup(buildPopup(offer, false, false));
      }

      if (!isHike && showOffers && offer.coords) {
        const isActiveDay = activeDayOfferIds.includes(offer.id);
        const isPlanned = plannedOfferIds.includes(offer.id);
        L.circleMarker(offer.coords, {
          radius: isActiveDay ? 12 : isPlanned ? 9 : 7,
          fillColor: isActiveDay ? "#c98a3a" : isPlanned ? "#9c6420" : offer.cardIncluded ? "#5a7f4b" : "#8aa57a",
          color: isActiveDay ? "#f3ead7" : isPlanned ? "#f3ead7" : "#162820",
          weight: isActiveDay ? 3 : isPlanned ? 2 : 1.5,
          opacity: 1,
          fillOpacity: isActiveDay ? 1 : 0.85,
        }).addTo(lg).bindPopup(buildPopup(offer, isPlanned, isActiveDay));
      }
    });
  }, [offers, plannedOfferIds, activeDayOfferIds, showOffers, showRoutes, homeBase]);

  return (
    <div className="space-y-4">
      <h2 className="font-serif font-light italic text-[22px] text-cream m-0 -tracking-[0.01em]">
        Karte — {homeBase.name} & Umgebung
      </h2>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowOffers(!showOffers)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${showOffers ? "bg-moss text-cream" : "bg-stone/50 text-moss-soft"}`}>
          <MapPin size={13} /> Angebote
        </button>
        <button onClick={() => setShowRoutes(!showRoutes)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${showRoutes ? "bg-moss text-cream" : "bg-stone/50 text-moss-soft"}`}>
          <Route size={13} /> Wanderrouten
        </button>
      </div>

      <div ref={mapRef} className="w-full h-[400px] sm:h-[500px] rounded-xl overflow-hidden border border-moss/30" />

      <div className="flex flex-wrap gap-4 text-[11px] text-moss-soft">
        <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded-full bg-amber inline-block border-2 border-cream" /> Heute</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-deep inline-block" /> Geplant</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-moss inline-block" /> Card inkl.</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-moss-soft inline-block" /> Angebot</span>
        <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-moss inline-block" /> Leicht</span>
        <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-amber inline-block" /> Mittel</span>
        <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-blood inline-block" /> Schwer</span>
      </div>
    </div>
  );
}

function buildPopup(offer: Offer, isPlanned: boolean, isActiveDay: boolean): string {
  const isHike = !!offer.hikeDetails;
  return `
    <div style="font-family: 'DM Sans', sans-serif; min-width: 160px;">
      <strong style="font-size: 13px;">${isHike ? "🥾 " : ""}${offer.name}</strong>
      <div style="font-size: 11px; color: #666; margin-top: 2px;">${offer.sub}</div>
      <div style="font-size: 11px; margin-top: 6px;">
        📍 ${offer.location}<br/>
        ⏱ ${offer.duration} · ${offer.price}
        ${offer.cardIncluded ? '<br/><span style="color: #c98a3a;">🎫 Card inkl.</span>' : ""}
        ${isActiveDay ? '<br/><span style="color: #c98a3a; font-weight: 600;">★ Heute geplant</span>' : isPlanned ? '<br/><span style="color: #9c6420;">✓ Geplant</span>' : ""}
      </div>
    </div>
  `;
}
