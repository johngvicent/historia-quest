// Historia Quest — utilidades de gamificación

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

export function nivelPorXp(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpParaSiguienteNivel(xp: number): { actual: number; siguiente: number; nivel: number } {
  const nivel = nivelPorXp(xp);
  const actual = LEVEL_THRESHOLDS[nivel - 1] ?? 0;
  const siguiente = LEVEL_THRESHOLDS[nivel] ?? actual + 1000;
  return { actual, siguiente, nivel };
}

export function progresoNivel(xp: number): number {
  const { actual, siguiente } = xpParaSiguienteNivel(xp);
  if (siguiente <= actual) return 100;
  return Math.min(100, Math.max(0, Math.round(((xp - actual) / (siguiente - actual)) * 100)));
}

export const DIFICULTAD_LABEL: Record<string, string> = {
  facil: "Fácil",
  medio: "Medio",
  dificil: "Difícil",
};

export const DIFICULTAD_COLOR: Record<string, string> = {
  facil: "bg-success/15 text-success border-success/30",
  medio: "bg-warning/20 text-warning-foreground border-warning/40",
  dificil: "bg-destructive/15 text-destructive border-destructive/30",
};

export const TIPO_LABEL: Record<string, string> = {
  test: "Test",
  vf: "Verdadero/Falso",
  orden: "Orden cronológico",
};

export const PERIODO_GRADIENT: Record<string, string> = {
  prehistoria: "from-amber-400 via-orange-500 to-rose-500",
  reyes_catolicos: "from-yellow-400 via-amber-500 to-orange-600",
  guerra_civil: "from-slate-500 via-orange-500 to-red-600",
  transicion: "from-cyan-400 via-sky-500 to-orange-500",
};

export function periodoGradient(periodo: string): string {
  return PERIODO_GRADIENT[periodo] ?? "from-orange-400 via-orange-500 to-cyan-500";
}
