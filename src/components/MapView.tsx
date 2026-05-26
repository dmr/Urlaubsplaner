import { useEffect, useRef, useState } from "react";
import { MapPin, Route } from "lucide-react";
import { OFFERS } from "@/data/offers";
import { HIKING_ROUTES, HikingRoute } from "@/data/hikingRoutes";
import { OFFER_COORDS } from "@/data/coords";
import type { Offer } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LOEFFINGEN: [number, number] = [47.884, 8.343];

const DIFFICULTY_COLORS: Record<string, string> = {
  leicht: "#5a7f4b",
  mittel: "#c98a3a",
  schwer: "#7d1f1f",
};

export default function MapView({
  plannedOfferIds,
  activeDayOfferIds = [],
}: {
  plannedOfferIds: string[];
  activeDayOfferIds?: string[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);
  const [showOffers, setShowOffers] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: LOEFFINGEN,
      zoom: 11,
      zoomControl: false,
    });

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

  useEffect(() => {
    const map = mapInstance.current;
    const lg = layerGroup.current;
    if (!map || !lg) return;

    lg.clearLayers();

    if (showOffers) {
      OFFERS.forEach((offer) => {
        const coords = OFFER_COORDS[offer.id];
        if (!coords) return;

        const isActiveDay = activeDayOfferIds.includes(offer.id);
        const isPlanned = plannedOfferIds.includes(offer.id);
        const marker = L.circleMarker(coords, {
          radius: isActiveDay ? 12 : isPlanned ? 9 : 7,
          fillColor: isActiveDay ? "#c98a3a" : isPlanned ? "#9c6420" : offer.cardIncluded ? "#5a7f4b" : "#8aa57a",
          color: isActiveDay ? "#f3ead7" : isPlanned ? "#f3ead7" : "#162820",
          weight: isActiveDay ? 3 : isPlanned ? 2 : 1.5,
          opacity: 1,
          fillOpacity: isActiveDay ? 1 : 0.85,
        }).addTo(lg);

        marker.bindPopup(buildOfferPopup(offer, isPlanned, isActiveDay));
      });
    }

    if (showRoutes) {
      HIKING_ROUTES.forEach((route) => {
        const color = DIFFICULTY_COLORS[route.difficulty] || "#5a7f4b";
        const polyline = L.polyline(route.path, {
          color,
          weight: 3.5,
          opacity: 0.85,
          dashArray: route.difficulty === "schwer" ? "8 5" : undefined,
        }).addTo(lg);

        polyline.bindPopup(buildRoutePopup(route));
      });
    }
  }, [plannedOfferIds, activeDayOfferIds, showOffers, showRoutes]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-light italic text-[22px] text-cream m-0 -tracking-[0.01em]">
          Karte & Wanderrouten
        </h2>
      </div>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowOffers(!showOffers)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
            showOffers
              ? "bg-moss text-cream"
              : "bg-stone/50 text-moss-soft"
          }`}
        >
          <MapPin size={13} /> Angebote
        </button>
        <button
          onClick={() => setShowRoutes(!showRoutes)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
            showRoutes
              ? "bg-moss text-cream"
              : "bg-stone/50 text-moss-soft"
          }`}
        >
          <Route size={13} /> Wanderrouten
        </button>
      </div>

      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full h-[400px] sm:h-[500px] rounded-xl overflow-hidden border border-moss/30"
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px] text-moss-soft">
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 rounded-full bg-amber inline-block border-2 border-cream" /> Heute
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-deep inline-block" /> Geplant
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-moss inline-block" /> Card inkl.
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-moss-soft inline-block" /> Angebot
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-0.5 bg-moss inline-block" /> Leicht
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-0.5 bg-amber inline-block" /> Mittel
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-0.5 bg-blood inline-block border-dashed" /> Schwer
        </span>
      </div>

      <div className="text-[11px] text-moss-soft mt-2 text-center">
        Wanderrouten findest du in der Angebotsliste unter dem Filter "Wandern".
      </div>
    </div>
  );
}


function buildOfferPopup(offer: Offer, isPlanned: boolean, isActiveDay: boolean): string {
  return `
    <div style="font-family: 'DM Sans', sans-serif; min-width: 160px;">
      <strong style="font-size: 13px;">${offer.name}</strong>
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

function buildRoutePopup(route: HikingRoute): string {
  return `
    <div style="font-family: 'DM Sans', sans-serif; min-width: 160px;">
      <strong style="font-size: 13px;">🥾 ${route.name}</strong>
      <div style="font-size: 11px; margin-top: 4px;">
        ${route.distance} · ${route.duration} · ${route.elevation}
      </div>
      <div style="font-size: 11px; color: #666; margin-top: 4px;">
        ${route.description}
      </div>
    </div>
  `;
}
