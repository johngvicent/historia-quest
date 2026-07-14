import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listTemas, getMyProfile } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { ALUMNO_NAV } from "@/components/nav-items";
import { periodoGradient } from "@/lib/gamification";
import { ChevronRight } from "lucide-react";

const temasOptions = queryOptions({
  queryKey: ["alumno-temas"],
  queryFn: () => listTemas(),
});
const profileOptions = queryOptions({
  queryKey: ["me"],
  queryFn: () => getMyProfile(),
});

export const Route = createFileRoute("/_authenticated/alumno/temas")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(temasOptions),
      context.queryClient.ensureQueryData(profileOptions),
    ]),
  component: TemasPage,
});

function TemasPage() {
  const { data } = useSuspenseQuery(temasOptions);
  const { data: me } = useSuspenseQuery(profileOptions);

  const pruebasByTema = new Map<string, number>();
  for (const p of data.pruebas) pruebasByTema.set(p.tema_id, (pruebasByTema.get(p.tema_id) ?? 0) + 1);
  const doneByPrueba = new Set(data.resultados.map((r) => r.prueba_id));

  return (
    <AppShell
      title="Temas históricos"
      subtitle="Elige un periodo y empieza tu aventura"
      nav={ALUMNO_NAV}
      user={me.profile}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.temas.map((t) => {
          const total = pruebasByTema.get(t.id) ?? 0;
          const done = data.pruebas
            .filter((p) => p.tema_id === t.id)
            .filter((p) => doneByPrueba.has(p.id)).length;
          return (
            <Link
              key={t.id}
              to="/alumno/temas/$temaId"
              params={{ temaId: t.id }}
              className="group block"
            >
              <GlassPanel className="overflow-hidden p-0 transition group-hover:scale-[1.02]">
                <div
                  className={`h-32 bg-gradient-to-br ${periodoGradient(t.periodo)} p-5 text-white`}
                >
                  <div className="text-xs uppercase tracking-wider opacity-80">Periodo</div>
                  <div className="mt-1 font-display text-2xl font-black leading-tight">
                    {t.titulo}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground line-clamp-2">{t.descripcion}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {done}/{total} retos
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      Empezar <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </GlassPanel>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
