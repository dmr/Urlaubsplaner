import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  accent?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, title, subtitle, badge, accent = "#6a9458", children }: BottomSheetProps) {
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) setDragY(diff);
  };
  const handleTouchEnd = () => {
    setDragging(false);
    if (dragY > 120) onClose();
    setDragY(0);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "88vh",
          backgroundColor: "var(--c-forest-deep)",
          transform: dragY > 0 ? `translateY(${dragY}px)` : "translateY(0)",
          transition: dragging ? "none" : "transform 0.2s ease-out",
        }}
      >
        {/* Colored accent bar + drag handle */}
        <div
          className="shrink-0 cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: accent }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-white/40 mx-auto mt-2.5 mb-2" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-cream/8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif italic text-[22px] text-cream leading-tight">{title}</h2>
              {badge && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: accent + "30", color: accent }}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <div className="text-[11px] text-moss-soft mt-0.5">{subtitle}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-cream/10 text-cream flex items-center justify-center hover:bg-cream/20 active:bg-cream/30"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-10">
          {children}
        </div>
      </div>
    </div>
  );
}
