import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, title, badge, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
    if (dragY > 120) {
      onClose();
    }
    setDragY(0);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/50" />

      {/* Sheet */}
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl overflow-hidden flex flex-col transition-transform duration-200"
        style={{
          maxHeight: "85vh",
          backgroundColor: "var(--c-forest-deep)",
          transform: dragY > 0 ? `translateY(${dragY}px)` : "translateY(0)",
          transition: dragging ? "none" : undefined,
        }}
      >
        {/* Handle bar */}
        <div
          className="pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-cream/20 mx-auto" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-light italic text-[20px] text-cream">{title}</h2>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-moss/20 text-moss-soft font-medium">
                {badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream/10 text-cream flex items-center justify-center hover:bg-cream/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
