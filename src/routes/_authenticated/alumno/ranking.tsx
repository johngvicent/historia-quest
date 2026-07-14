import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listRanking, getMyProfile } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { ALUMNO_NAV } from "@/components/nav-items";
import { Crown, Medal, Trophy } from "lucide-react";

const rankingOptions = queryOptions({
  queryKey: ["ranking"],
  queryFn: () => listRanking(),
});

export const Route = createFileRoute("/_authenticated/alumno/ranking")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(rankingOptions),
      context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: () => getMyProfile() }),
    ]),
  component: RankingPage,
});

const ICONS = [Crown, Trophy, Medal];

function RankingPage() {
  const { data } = useSuspenseQuery(rankingOptions);
  const { data: me } = useSuspenseQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  return (
    <AppShell title="Ranking" subtitle="Los mejores historiadores" nav={ALUMNO_NAV} user={me.profile}>
      <GlassPanel className="p-4 sm:p-6">
        <ol className="divide-y divide-border/50">
          {data.ranking.map((r, i) => {
            const Ic = ICONS[i] ?? null;
            const isMe = r.id === me.profile?.id;
            return (
              <li
                key={r.id}
                className={`flex items-center gap-4 py-3 ${isMe ? "bg-primary/5 rounded-xl px-2" : "px-2"}`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-black ${
                    i < 3 ? "bg-brand text-primary-foreground shadow-glow" : "bg-white/70 text-foreground"
                  }`}
                >
                  {Ic ? <Ic className="h-4 w-4" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">
                    {r.nombre} {isMe && <span className="text-xs text-primary">(tú)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">Nivel {r.nivel}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-black">{r.xp}</div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </div>
              </li>
            );
          })}
        </ol>
      </GlassPanel>
    </AppShell>
  );
}
