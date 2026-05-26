import { RotateCcw } from "lucide-react";

interface FooterProps {
  onReset: () => void;
}

export default function Footer({ onReset }: FooterProps) {
  return (
    <footer className="px-5 py-5 border-t border-cream/10 mt-5 flex justify-between items-center flex-wrap gap-3">
      <div className="text-[11px] text-moss-soft">
        Alle Daten lokal im Browser · Auto-Save aktiv
      </div>
      <button
        onClick={onReset}
        className="bg-transparent border border-cream/20 text-cream px-4 py-2.5 rounded-sm text-[12px] tracking-wider uppercase cursor-pointer flex items-center gap-1.5 hover:bg-cream/5 active:bg-cream/10"
      >
        <RotateCcw size={11} /> Alles zurücksetzen
      </button>
    </footer>
  );
}
