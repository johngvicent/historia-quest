import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listAllInsignias, getMyProfile } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { ALUMNO_NAV } from "@/components/nav-items";
import { Award, Coins, Compass, Crown, Sparkles, Star, Trophy } from "lucide-react";

const opts = queryOptions({ queryKey: ["insignias"], queryFn: () => listAllInsignias() });

export const Route = createFileRoute("/_authenticated/alumno/insignias")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(opts),
      context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: () => getMyProfile() }),
    ]),
  component: InsigniasPage,
});

const ICON_MAP = { Award, Trophy, Sparkles, Compass, Star, Crown, Coins } as const;

function InsigniasPage() {
  const { data } = useSuspenseQuery(opts);
  const { data: me } = useSuspenseQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  const obtenidas = new Set(data.obtenidas.map((o) => o.insignia_id));
  return (
    <AppShell title="Insignias" subtitle="Colecciona tus logros" nav={ALUMNO_NAV} user={me.profile}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.insignias.map((ins) => {
          const has = obtenidas.has(ins.id);
          const Icon = (ICON_MAP as Record<string, typeof Award>)[ins.icono] ?? Award;
          return (
            <GlassPanel key={ins.id} className={`p-6 text-center ${has ? "" : "opacity-60"}`}>
              <div
                className={`mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl ${
                  has ? "bg-brand text-primary-foreground shadow-glow" : "bg-white/60 text-muted-foreground"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold">{ins.nombre}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{ins.descripcion}</p>
              {!has && <div className="mt-3 text-xs italic text-muted-foreground">Aún por desbloquear</div>}
            </GlassPanel>
          );
        })}
      </div>
    </AppShell>
  );
}
