import { useState } from "react";
import { Offer } from "@/lib/types";
import { Plus, Globe, Loader2, X, MapPin } from "lucide-react";

interface AddCustomOfferProps {
  onAdd: (offer: Offer) => void;
  onClose: () => void;
}

async function fetchMeta(url: string): Promise<{ title: string; description: string; image: string }> {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  const og = (prop: string) =>
    doc.querySelector(`meta[property="og:${prop}"]`)?.getAttribute("content") ?? "";

  const title =
    og("title") ||
    doc.querySelector("title")?.textContent?.trim() ||
    "";

  const description =
    og("description") ||
    doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
    "";

  const image = og("image") || "";

  return { title, description, image };
}

let customCounter = 0;

export default function AddCustomOffer({ onAdd, onClose }: AddCustomOfferProps) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [location, setLocation] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    if (!url.trim()) return;
    setFetching(true);
    setError("");
    try {
      let fetchUrl = url.trim();
      if (!fetchUrl.startsWith("http")) fetchUrl = "https://" + fetchUrl;
      const meta = await fetchMeta(fetchUrl);
      setName(meta.title || name);
      setDescription(meta.description || description);
      if (meta.image) setImage(meta.image);
      if (!url.startsWith("http")) setUrl(fetchUrl);
    } catch {
      setError("Seite konnte nicht geladen werden — bitte manuell ausfüllen.");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const id = `custom-${Date.now()}-${++customCounter}`;
    const offer: Offer = {
      id,
      name: name.trim(),
      sub: "Eigener Ort",
      location: location.trim() || "Schwarzwald",
      distance: 0,
      duration: "",
      minAge: 0,
      tags: ["outdoor"],
      price: "Gratis",
      cardIncluded: false,
      description: description.trim(),
      url: url.trim() || undefined,
      images: image ? [image] : undefined,
    };
    onAdd(offer);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-parchment rounded-lg w-full max-w-[500px] my-4 relative">
        <div className="sticky top-0 z-20 flex justify-end p-2 pointer-events-none">
          <button
            onClick={onClose}
            className="pointer-events-auto bg-ink/70 text-cream w-10 h-10 rounded-full flex items-center justify-center hover:bg-ink shadow-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="font-serif font-medium text-[24px] text-ink mb-1">
            Eigenen Ort hinzufügen
          </h2>
          <p className="text-[13px] text-stone mb-4">
            Link einfügen — Infos werden automatisch abgerufen.
          </p>

          {/* URL input + fetch */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="https://www.beispiel.de/attraktion"
                className="w-full bg-cream-soft border border-stone/20 rounded-lg pl-9 pr-3 py-2.5 text-[13px] text-ink placeholder:text-stone/50 outline-none focus:border-amber/50"
              />
            </div>
            <button
              onClick={handleFetch}
              disabled={fetching || !url.trim()}
              className="px-4 py-2.5 bg-moss text-cream rounded-lg text-[12px] font-medium flex items-center gap-1.5 disabled:opacity-50 hover:bg-moss/80"
            >
              {fetching ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              Abrufen
            </button>
          </div>

          {error && (
            <div className="text-[12px] text-rust mb-3">{error}</div>
          )}

          {/* Preview image */}
          {image && (
            <div className="mb-3 h-[140px] rounded-lg overflow-hidden bg-forest-deep">
              <img
                src={image}
                alt="Vorschau"
                className="w-full h-full object-cover"
                onError={() => setImage("")}
              />
            </div>
          )}

          {/* Editable fields */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone block mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Berggasthof Sonnenmatte"
                className="w-full bg-cream-soft border border-stone/20 rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-amber/50"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone block mb-1">Ort</label>
              <div className="relative">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="z.B. Todtnau, 30 km"
                  className="w-full bg-cream-soft border border-stone/20 rounded pl-9 pr-3 py-2 text-[13px] text-ink outline-none focus:border-amber/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone block mb-1">Beschreibung</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Was gibt es dort?"
                rows={3}
                className="w-full bg-cream-soft border border-stone/20 rounded px-3 py-2 text-[13px] text-ink resize-y outline-none focus:border-amber/50"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone block mb-1">Bild-URL (optional)</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full bg-cream-soft border border-stone/20 rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-amber/50"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="mt-4 w-full py-3 bg-forest text-cream rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-forest-deep"
          >
            <Plus size={15} /> Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}
