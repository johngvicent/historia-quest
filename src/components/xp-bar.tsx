import { progresoNivel, xpParaSiguienteNivel } from "@/lib/gamification";

export function XPBar({ xp }: { xp: number }) {
  const { actual, siguiente, nivel } = xpParaSiguienteNivel(xp);
  const pct = progresoNivel(xp);
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold text-foreground">Nivel {nivel}</span>
        <span className="text-muted-foreground">
          {xp - actual} / {siguiente - actual} XP
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/50 shadow-inner">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
