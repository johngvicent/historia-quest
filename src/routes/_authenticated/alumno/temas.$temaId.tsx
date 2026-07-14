import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getTema, getMyProfile } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { ALUMNO_NAV } from "@/components/nav-items";
import { DIFICULTAD_COLOR, DIFICULTAD_LABEL, periodoGradient } from "@/lib/gamification";
import { Clock, Coins, Play, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/alumno/temas/$temaId")({
  loader: async ({ params, context }) => {
    const opts = queryOptions({
      queryKey: ["alumno-tema", params.temaId],
      queryFn: () => getTema({ data: { temaId: params.temaId } }),
    });
    await Promise.all([
      context.queryClient.ensureQueryData(opts),
      context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: () => getMyProfile() }),
    ]);
  },
  component: TemaPage,
});

function TemaPage() {
  const { temaId } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["alumno-tema", temaId],
    queryFn: () => getTema({ data: { temaId } }),
  });
  const { data: me } = useSuspenseQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });

  const doneMap = new Map(data.resultados.map((r) => [r.prueba_id, r]));

  return (
    <AppShell
      title={data.tema.titulo}
      subtitle="Retos del tema"
      nav={ALUMNO_NAV}
      user={me.profile}
    >
      <GlassPanel
        strong
        className={`mb-6 overflow-hidden bg-gradient-to-br ${periodoGradient(data.tema.periodo)} p-6 text-white`}
      >
        <p className="max-w-2xl text-sm opacity-90">{data.tema.descripcion}</p>
      </GlassPanel>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.pruebas.map((p) => {
          const done = doneMap.get(p.id);
          return (
            <GlassPanel key={p.id} className="p-6">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${DIFICULTAD_COLOR[p.dificultad]}`}
                >
                  {DIFICULTAD_LABEL[p.dificultad]}
                </span>
                {done && (
                  <span className="text-xs text-success font-semibold">
                    ✓ {done.aciertos}/{done.total}
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-display text-lg font-bold">{p.titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.descripcion}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {p.tiempo_estimado} min
                </span>
                <span className="inline-flex items-center gap-1 text-primary font-semibold">
                  <Sparkles className="h-3.5 w-3.5" /> +{p.xp_reward} XP
                </span>
                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                  <Coins className="h-3.5 w-3.5" /> +{p.monedas_reward}
                </span>
              </div>
              <Link
                to="/alumno/reto/$pruebaId"
                params={{ pruebaId: p.id }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95"
              >
                <Play className="h-4 w-4" /> {done ? "Reintentar" : "Empezar reto"}
              </Link>
            </GlassPanel>
          );
        })}
      </div>
    </AppShell>
  );
}
