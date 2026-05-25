import { useEffect, useRef, useState } from "react";
import { MapPin, Mountain, AlertTriangle, Route } from "lucide-react";
import { OFFERS } from "@/data/offers";
import { HIKING_ROUTES, HikingRoute } from "@/data/hikingRoutes";
import type { Offer } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LOEFFINGEN: [number, number] = [47.884, 8.343];

const OFFER_COORDS: Record<string, [number, number]> = {
  tatzmania: [47.882, 8.340],
  waldbad: [47.886, 8.345],
  "hallenbad-dittis": [47.895, 8.330],
  sauschwaenzle: [47.840, 8.532],
  schluchsee: [47.819, 8.182],
  titisee: [47.900, 8.145],
  badeparadies: [47.897, 8.150],
  feldberg: [47.858, 8.005],
  gauchach: [47.873, 8.338],
  wutachschlucht: [47.850, 8.310],
  steinwasen: [47.905, 7.915],
  hasenhorn: [47.834, 7.945],
  triberg: [48.131, 8.231],
  blackforestline: [47.835, 7.940],
  ortsrallye: [47.884, 8.343],
  "house-of-senses": [48.094, 7.962],
  "aqwa-waldbad-waldkirch": [48.092, 7.963],
  fundorena: [47.856, 8.004],
  "kletterwald-feldberg": [47.860, 8.010],
  "heimatmuseum-huefingen": [47.927, 8.487],
  "donaueschingen-quelle": [47.952, 8.505],
  "fuerstenberg-brauerei": [47.950, 8.503],
  "welde-schokolade": [47.870, 8.190],
  "schluchtensteig-lenzkirch": [47.872, 8.198],
  windgfaellweiher: [47.850, 8.170],
  "hochfirst-turm": [47.895, 8.150],
  "naturerlebnispfad-hinterzarten": [47.900, 8.100],
  "adler-skistadion": [47.901, 8.105],
  vogtsbauernhof: [48.276, 8.218],
  "uhrenmuseum-furtwangen": [48.052, 8.207],
  lotenbachklamm: [47.830, 8.340],
  "radon-revital-bad": [47.815, 8.030],
  "menzenschwander-wasserfaelle": [47.810, 8.040],
  "Dom-st-blasien": [47.763, 8.127],
  "badkrozingen-vita-classica": [47.919, 7.699],
  "schwarzwaldhaus-natur": [47.857, 8.003],
  "mundenhof-freiburg": [47.979, 7.800],
};

const DIFFICULTY_COLORS: Record<string, string> = {
  leicht: "#5a7f4b",
  mittel: "#c98a3a",
  schwer: "#7d1f1f",
};

export default function MapView({
  plannedOfferIds,
}: {
  plannedOfferIds: string[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<HikingRoute | null>(null);
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

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    if (showOffers) {
      OFFERS.forEach((offer) => {
        const coords = OFFER_COORDS[offer.id];
        if (!coords) return;

        const isPlanned = plannedOfferIds.includes(offer.id);
        const marker = L.circleMarker(coords, {
          radius: isPlanned ? 10 : 7,
          fillColor: isPlanned ? "#c98a3a" : offer.cardIncluded ? "#5a7f4b" : "#8aa57a",
          color: isPlanned ? "#f3ead7" : "#162820",
          weight: isPlanned ? 2.5 : 1.5,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map);

        marker.bindPopup(buildOfferPopup(offer, isPlanned));
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
        }).addTo(map);

        polyline.bindPopup(buildRoutePopup(route));
        polyline.on("click", () => setSelectedRoute(route));
      });
    }
  }, [plannedOfferIds, showOffers, showRoutes]);

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
          <span className="w-3 h-3 rounded-full bg-amber inline-block" /> Geplant
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

      {/* Hiking routes list */}
      <div className="space-y-3 pt-2">
        <h3 className="font-serif italic text-[18px] text-cream">
          <Mountain size={16} className="inline mr-2 -mt-0.5" />
          Wanderrouten um Löffingen
        </h3>
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {HIKING_ROUTES.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              isSelected={selectedRoute?.id === route.id}
              onSelect={() => {
                setSelectedRoute(route);
                const map = mapInstance.current;
                if (map && route.path.length > 0) {
                  const bounds = L.latLngBounds(route.path);
                  map.fitBounds(bounds, { padding: [40, 40] });
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteCard({
  route,
  isSelected,
  onSelect,
}: {
  route: HikingRoute;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const color = DIFFICULTY_COLORS[route.difficulty];

  return (
    <button
      onClick={onSelect}
      className={`text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? "bg-forest border-moss/60 ring-1 ring-moss/40"
          : "bg-forest-deep/60 border-moss/20 hover:border-moss/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-[14px] font-medium text-cream leading-tight">
          {route.name}
        </h4>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
          style={{ backgroundColor: color + "30", color }}
        >
          {route.difficulty}
        </span>
      </div>

      <p className="text-[12px] text-moss-soft leading-relaxed mb-2">
        {route.description}
      </p>

      <div className="flex flex-wrap gap-3 text-[11px] text-cream-soft">
        <span>{route.distance}</span>
        <span>{route.duration}</span>
        <span>{route.elevation}</span>
      </div>

      {route.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {route.highlights.map((h) => (
            <span
              key={h}
              className="text-[10px] px-2 py-0.5 rounded-full bg-stone/50 text-moss-soft"
            >
              {h}
            </span>
          ))}
        </div>
      )}

      {route.warning && (
        <div className="flex items-center gap-1 mt-2 text-[11px] text-amber">
          <AlertTriangle size={12} /> {route.warning}
        </div>
      )}
    </button>
  );
}

function buildOfferPopup(offer: Offer, isPlanned: boolean): string {
  return `
    <div style="font-family: 'DM Sans', sans-serif; min-width: 160px;">
      <strong style="font-size: 13px;">${offer.name}</strong>
      <div style="font-size: 11px; color: #666; margin-top: 2px;">${offer.sub}</div>
      <div style="font-size: 11px; margin-top: 6px;">
        📍 ${offer.location}<br/>
        ⏱ ${offer.duration} · ${offer.price}
        ${offer.cardIncluded ? '<br/><span style="color: #c98a3a;">🎫 Card inkl.</span>' : ""}
        ${isPlanned ? '<br/><span style="color: #c98a3a; font-weight: 600;">✓ Geplant</span>' : ""}
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
