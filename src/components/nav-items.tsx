import { BookOpen, Home, Medal, Trophy } from "lucide-react";
import type { ReactNode } from "react";

export const ALUMNO_NAV: { to: string; label: string; icon: ReactNode }[] = [
  { to: "/alumno", label: "Inicio", icon: <Home className="h-4 w-4" /> },
  { to: "/alumno/temas", label: "Temas", icon: <BookOpen className="h-4 w-4" /> },
  { to: "/alumno/ranking", label: "Ranking", icon: <Trophy className="h-4 w-4" /> },
  { to: "/alumno/insignias", label: "Insignias", icon: <Medal className="h-4 w-4" /> },
];

export const PROFESOR_NAV: { to: string; label: string; icon: ReactNode }[] = [
  { to: "/profesor", label: "Resumen", icon: <Home className="h-4 w-4" /> },
  { to: "/profesor/temas", label: "Temas", icon: <BookOpen className="h-4 w-4" /> },
  { to: "/profesor/pruebas", label: "Pruebas", icon: <Trophy className="h-4 w-4" /> },
  { to: "/profesor/alumnos", label: "Alumnos", icon: <Medal className="h-4 w-4" /> },
  { to: "/profesor/estadisticas", label: "Estadísticas", icon: <Trophy className="h-4 w-4" /> },
];
