import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getTeacherDashboard } from "@/lib/teacher.functions";
import { getMyProfile } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { PROFESOR_NAV } from "@/components/nav-items";
import { Activity, BookOpen, GraduationCap, Percent } from "lucide-react";

const opts = queryOptions({ queryKey: ["teacher-dashboard"], queryFn: () => getTeacherDashboard() });

export const Route = createFileRoute("/_authenticated/profesor/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(opts),
      context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: () => getMyProfile() }),
    ]),
  component: ProfIndex,
});

function ProfIndex() {
  const { data } = useSuspenseQuery(opts);
  const { data: me } = useSuspenseQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  return (
    <AppShell title="Panel del Profesor" subtitle="Vista general del aula" nav={PROFESOR_NAV} user={me.profile}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<GraduationCap className="h-5 w-5" />} label="Alumnos" value={data.totalAlumnos} />
        <KpiCard icon={<BookOpen className="h-5 w-5" />} label="Temas" value={data.temas.length} />
        <KpiCard icon={<Activity className="h-5 w-5" />} label="Pruebas" value={data.pruebas.length} />
        <KpiCard icon={<Percent className="h-5 w-5" />} label="Aciertos medios" value={`${data.mediaPct}%`} />
      </div>

      <GlassPanel className="mt-6 p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Actividad reciente</h2>
        {data.resultadosRecientes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay actividad del alumnado.</p>
        ) : (
          <ul className="divide-y divide-border/40">
            {data.resultadosRecientes.map((r) => {
              const nombre = r.nombreAlumno;
              const prueba = r.pruebas?.titulo;
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{nombre}</div>
                    <div className="text-xs text-muted-foreground">{prueba}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">
                      {r.aciertos}/{r.total}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </GlassPanel>
    </AppShell>
  );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <GlassPanel className="p-5">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-primary-foreground shadow-glow">
        {icon}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-black">{value}</div>
    </GlassPanel>
  );
}
