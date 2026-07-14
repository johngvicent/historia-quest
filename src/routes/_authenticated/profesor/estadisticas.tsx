import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getEstadisticas } from "@/lib/teacher.functions";
import { getMyProfile } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { PROFESOR_NAV } from "@/components/nav-items";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const opts = queryOptions({ queryKey: ["teacher-estadisticas"], queryFn: () => getEstadisticas() });

export const Route = createFileRoute("/_authenticated/profesor/estadisticas")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(opts),
      context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: () => getMyProfile() }),
    ]),
  component: Estadisticas,
});

function Estadisticas() {
  const { data } = useSuspenseQuery(opts);
  const { data: me } = useSuspenseQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });

  const byTema = new Map<string, { titulo: string; aciertos: number; total: number }>();
  for (const r of data) {
    const t = (r as { pruebas: { temas: { titulo: string } | null } | null }).pruebas?.temas?.titulo ?? "Otros";
    const cur = byTema.get(t) ?? { titulo: t, aciertos: 0, total: 0 };
    cur.aciertos += r.aciertos;
    cur.total += r.total;
    byTema.set(t, cur);
  }
  const chartData = Array.from(byTema.values()).map((t) => ({
    tema: t.titulo,
    aciertos: t.total > 0 ? Math.round((t.aciertos / t.total) * 100) : 0,
  }));

  return (
    <AppShell title="Estadísticas" subtitle="Rendimiento por tema" nav={PROFESOR_NAV} user={me.profile}>
      <GlassPanel strong className="p-6">
        <h2 className="mb-4 font-display text-lg font-bold">% de aciertos por tema</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay datos suficientes.</p>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="tema" fontSize={12} />
                <YAxis fontSize={12} domain={[0, 100]} unit="%" />
                <Tooltip />
                <Bar dataKey="aciertos" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassPanel>

      <GlassPanel className="mt-6 p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Total de intentos: {data.length}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Aciertos totales" value={data.reduce((a, r) => a + r.aciertos, 0)} />
          <Stat label="Preguntas respondidas" value={data.reduce((a, r) => a + r.total, 0)} />
          <Stat label="XP repartido" value={data.reduce((a, r) => a + r.xp_ganado, 0)} />
        </div>
      </GlassPanel>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-black">{value}</div>
    </div>
  );
}
