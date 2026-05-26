import { RotateCcw, Share2 } from "lucide-react";

interface FooterProps {
  onReset: () => void;
  onShare: () => void;
}

export default function Footer({ onReset, onShare }: FooterProps) {
  return (
    <footer className="px-5 py-5 border-t border-cream/10 mt-5 flex justify-between items-center flex-wrap gap-3">
      <div className="text-[11px] text-moss-soft">
        Alle Daten lokal im Browser · Auto-Save aktiv
      </div>
      <div className="flex gap-2">
        <button
          onClick={onShare}
          className="bg-transparent border border-cream/20 text-cream px-4 py-2.5 rounded-sm text-[12px] tracking-wider uppercase cursor-pointer flex items-center gap-1.5 hover:bg-cream/5 active:bg-cream/10"
        >
          <Share2 size={12} /> Plan teilen
        </button>
        <button
          onClick={onReset}
          className="bg-transparent border border-cream/20 text-cream px-4 py-2.5 rounded-sm text-[12px] tracking-wider uppercase cursor-pointer flex items-center gap-1.5 hover:bg-cream/5 active:bg-cream/10"
        >
          <RotateCcw size={12} /> Zurücksetzen
        </button>
      </div>
    </footer>
  );
}
