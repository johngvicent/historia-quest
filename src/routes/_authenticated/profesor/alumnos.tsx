import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listAlumnos } from "@/lib/teacher.functions";
import { getMyProfile } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { PROFESOR_NAV } from "@/components/nav-items";

const opts = queryOptions({ queryKey: ["teacher-alumnos"], queryFn: () => listAlumnos() });

export const Route = createFileRoute("/_authenticated/profesor/alumnos")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(opts),
      context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: () => getMyProfile() }),
    ]),
  component: AlumnosProfesor,
});

function AlumnosProfesor() {
  const { data } = useSuspenseQuery(opts);
  const { data: me } = useSuspenseQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  return (
    <AppShell title="Alumnos" subtitle="Gestión y seguimiento" nav={PROFESOR_NAV} user={me.profile}>
      <GlassPanel className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-white/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Nivel</th>
              <th className="p-4">XP</th>
              <th className="p-4">Retos</th>
              <th className="p-4">Aciertos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {data.map((a) => {
              const pct = a.stats.total > 0 ? Math.round((a.stats.aciertos / a.stats.total) * 100) : 0;
              return (
                <tr key={a.id} className="hover:bg-white/40">
                  <td className="p-4 font-semibold">{a.nombre}</td>
                  <td className="p-4">{a.nivel}</td>
                  <td className="p-4">{a.xp}</td>
                  <td className="p-4">{a.stats.retos}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Aún no hay alumnos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassPanel>
    </AppShell>
  );
}
