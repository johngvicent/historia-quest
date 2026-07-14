import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getStudentDashboard } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { XPBar } from "@/components/xp-bar";
import { ALUMNO_NAV } from "@/components/nav-items";
import { Award, ChevronRight, Sparkles, Trophy } from "lucide-react";
import { periodoGradient } from "@/lib/gamification";

const dashboardOptions = queryOptions({
  queryKey: ["student-dashboard"],
  queryFn: () => getStudentDashboard(),
});

export const Route = createFileRoute("/_authenticated/alumno/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardOptions),
  component: AlumnoIndex,
});

function AlumnoIndex() {
  const { data } = useSuspenseQuery(dashboardOptions);
  const profile = data.profile ?? { nombre: "Alumno/a", xp: 0, nivel: 1, monedas: 0 };
  return (
    <AppShell
      title={`Hola, ${profile.nombre} 👋`}
      subtitle="Panel del alumno"
      nav={ALUMNO_NAV}
      user={profile}
    >
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <GlassPanel strong className="p-6">
          <div className="mb-2 text-sm font-semibold text-muted-foreground">Tu progreso</div>
          <XPBar xp={profile.xp ?? 0} />
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat icon={<Sparkles className="h-4 w-4" />} label="XP" value={profile.xp ?? 0} />
            <Stat icon={<Trophy className="h-4 w-4" />} label="Nivel" value={profile.nivel ?? 1} />
            <Stat icon={<Award className="h-4 w-4" />} label="Insignias" value={data.insignias.length} />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Tus insignias</h2>
            <Link to="/alumno/insignias" className="text-xs font-semibold text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          {data.insignias.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no tienes insignias. ¡Completa un reto!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.insignias.slice(0, 6).map((i) => {
                const ins = (i as { insignias: { nombre: string } | null }).insignias;
                return (
                  <span
                    key={i.insignia_id}
                    className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow"
                  >
                    {ins?.nombre}
                  </span>
                );
              })}
            </div>
          )}
        </GlassPanel>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <GlassPanel className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Misiones disponibles</h2>
            <Link to="/alumno/temas" className="text-xs font-semibold text-primary hover:underline">
              Ver temas
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.temas.slice(0, 4).map((t) => (
              <Link
                key={t.id}
                to="/alumno/temas/$temaId"
                params={{ temaId: t.id }}
                className={`group overflow-hidden rounded-2xl bg-gradient-to-br ${periodoGradient(
                  t.periodo,
                )} p-4 text-white shadow-lg transition hover:scale-[1.02]`}
              >
                <div className="text-xs uppercase tracking-wider opacity-80">{t.periodo.replace("_", " ")}</div>
                <div className="mt-1 flex items-center justify-between font-display text-base font-bold">
                  {t.titulo}
                  <ChevronRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Actividad reciente</h2>
          {data.resultados.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin actividad todavía.</p>
          ) : (
            <ul className="space-y-3">
              {data.resultados.slice(0, 5).map((r) => {
                const p = (r as { pruebas: { titulo: string } | null }).pruebas;
                return (
                  <li key={r.id} className="flex items-center justify-between rounded-xl bg-white/60 p-3 text-sm">
                    <div>
                      <div className="font-semibold">{p?.titulo ?? "Reto"}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.aciertos}/{r.total} aciertos
                      </div>
                    </div>
                    <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                      +{r.xp_ganado} XP
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassPanel>
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white/60 p-3 text-center">
      <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center text-primary">{icon}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-black">{value}</div>
    </div>
  );
}
