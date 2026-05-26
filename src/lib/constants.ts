import { BreakType } from "./types";
import {
  Coffee,
  UtensilsCrossed,
  Sunset,
  Cookie,
  Pause,
} from "lucide-react";

export const BREAK_META: Record<
  BreakType,
  { label: string; icon: typeof Coffee; color: string }
> = {
  breakfast: { label: "Frühstück", icon: Coffee, color: "#c98a3a" },
  lunch: { label: "Mittagessen", icon: UtensilsCrossed, color: "#5a7f4b" },
  dinner: { label: "Abendessen", icon: Sunset, color: "#a14a2a" },
  snack: { label: "Snack / Eis", icon: Cookie, color: "#9c6420" },
  pause: { label: "Pause", icon: Pause, color: "#8aa57a" },
};
