import { useEffect, useRef } from "react";
import type { HikeDetails } from "@/lib/types";
import { googleMapsDirectionsUrl } from "@/data/coords";
import { Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function HikeMapSection({ details }: { details: HikeDetails }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || details.path.length < 2) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 16,
    }).addTo(map);

    const color =
      details.difficulty === "leicht" ? "#6a9458" :
      details.difficulty === "mittel" ? "#d49540" : "#a03030";

    const polyline = L.polyline(details.path, {
      color,
      weight: 4,
      opacity: 0.85,
    }).addTo(map);

    // Start marker
    L.circleMarker(details.path[0], {
      radius: 7, fillColor: "#6a9458", color: "#fff", weight: 2, fillOpacity: 1,
    }).addTo(map).bindPopup("Start");

    // End marker
    const last = details.path[details.path.length - 1];
    if (last[0] !== details.path[0][0] || last[1] !== details.path[0][1]) {
      L.circleMarker(last, {
        radius: 7, fillColor: "#a03030", color: "#fff", weight: 2, fillOpacity: 1,
      }).addTo(map).bindPopup("Ende");
    }

    // Parking marker
    if (details.parking) {
      L.circleMarker(details.parking.coords, {
        radius: 6, fillColor: "#d49540", color: "#fff", weight: 2, fillOpacity: 1,
      }).addTo(map).bindPopup(`<b>P</b> ${details.parking.name}`);
    }

    map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

    return () => { map.remove(); };
  }, [details]);

  return (
    <div>
      <div
        ref={mapRef}
        className="w-full h-[220px] rounded-lg overflow-hidden border border-stone/20"
      />
      {details.parking && (
        <a
          href={googleMapsDirectionsUrl(details.parking.coords[0], details.parking.coords[1])}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 text-[12px] text-stone underline hover:text-ink"
        >
          <Navigation size={12} /> Route zum Parkplatz ({details.parking.name})
        </a>
      )}
    </div>
  );
}
