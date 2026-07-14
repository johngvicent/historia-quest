import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPrueba, submitReto, getMyProfile } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { ALUMNO_NAV } from "@/components/nav-items";
import { Button } from "@/components/ui/button";
import { TIPO_LABEL } from "@/lib/gamification";
import { ArrowDown, ArrowUp, Check, ChevronRight, Sparkles, X, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/alumno/reto/$pruebaId")({
  loader: ({ params, context }) => {
    const opts = queryOptions({
      queryKey: ["reto", params.pruebaId],
      queryFn: () => getPrueba({ data: { pruebaId: params.pruebaId } }),
    });
    return Promise.all([
      context.queryClient.ensureQueryData(opts),
      context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: () => getMyProfile() }),
    ]);
  },
  component: RetoPage,
});

type Respuesta = { preguntaId: string; valor: unknown };

function RetoPage() {
  const { pruebaId } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["reto", pruebaId],
    queryFn: () => getPrueba({ data: { pruebaId } }),
  });
  const { data: me } = useSuspenseQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const submit = useServerFn(submitReto);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<string, unknown>>(new Map());
  const [result, setResult] = useState<null | Awaited<ReturnType<typeof submitReto>>>(null);
  const startedAt = useRef<number>(Date.now());

  const preguntas = data.preguntas;
  const total = preguntas.length;
  const current = preguntas[idx];

  const mutation = useMutation({
    mutationFn: async (respuestas: Respuesta[]) => {
      const tiempoSeg = Math.round((Date.now() - startedAt.current) / 1000);
      return submit({ data: { pruebaId, respuestas, tiempoSeg } });
    },
    onSuccess: (res) => {
      setResult(res);
      qc.invalidateQueries();
      if (res.nuevasInsignias.length > 0) {
        toast.success(`¡Nueva insignia! (${res.nuevasInsignias.length})`);
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error"),
  });

  function setAnswer(v: unknown) {
    setAnswers((prev) => {
      const n = new Map(prev);
      n.set(current.id, v);
      return n;
    });
  }

  function handleNext() {
    if (idx < total - 1) setIdx(idx + 1);
    else {
      const respuestas: Respuesta[] = preguntas.map((p) => ({
        preguntaId: p.id,
        valor: answers.get(p.id) ?? null,
      }));
      mutation.mutate(respuestas);
    }
  }

  if (result) return <ResultScreen result={result} pruebaId={pruebaId} me={me.profile} />;

  const currentAnswer = answers.get(current?.id);
  const canAdvance = currentAnswer !== undefined && currentAnswer !== null;

  return (
    <AppShell title={data.prueba.titulo} subtitle="Reto en curso" nav={ALUMNO_NAV} user={me.profile}>
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Pregunta {idx + 1} de {total}
        </span>
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          {TIPO_LABEL[current.tipo] ?? current.tipo}
        </span>
      </div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/60">
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${((idx + 1) / total) * 100}%` }}
        />
      </div>

      <GlassPanel strong className="p-6 sm:p-8">
        <h2 className="mb-6 font-display text-xl font-black sm:text-2xl">{current.enunciado}</h2>

        {current.tipo === "test" && (
          <TestAnswer
            opciones={(current.opciones as string[]) ?? []}
            value={currentAnswer as number | undefined}
            onChange={setAnswer}
          />
        )}
        {current.tipo === "vf" && (
          <VFAnswer value={currentAnswer as boolean | undefined} onChange={setAnswer} />
        )}
        {current.tipo === "orden" && (
          <OrdenAnswer
            opciones={(current.opciones as string[]) ?? []}
            value={currentAnswer as number[] | undefined}
            onChange={setAnswer}
          />
        )}

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!canAdvance || mutation.isPending}
            className="rounded-full bg-brand px-6 py-2.5 font-semibold text-primary-foreground shadow-glow hover:opacity-95"
          >
            {idx < total - 1 ? (
              <>
                Siguiente <ChevronRight className="ml-1 h-4 w-4" />
              </>
            ) : mutation.isPending ? (
              "Enviando…"
            ) : (
              "Terminar reto"
            )}
          </Button>
        </div>
      </GlassPanel>
    </AppShell>
  );
}

function TestAnswer({
  opciones,
  value,
  onChange,
}: {
  opciones: string[];
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {opciones.map((o, i) => {
        const active = value === i;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`rounded-2xl border-2 p-4 text-left transition ${
              active
                ? "border-primary bg-primary/10 shadow-glow"
                : "border-border/60 bg-white/60 hover:border-primary/40"
            }`}
          >
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-xs font-bold text-primary">
              {String.fromCharCode(65 + i)}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function VFAnswer({
  value,
  onChange,
}: {
  value: boolean | undefined;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex items-center gap-3 rounded-2xl border-2 p-5 transition ${
          value === true
            ? "border-success bg-success/10 shadow-glow"
            : "border-border/60 bg-white/60 hover:border-success/40"
        }`}
      >
        <Check className="h-6 w-6 text-success" />
        <span className="font-display text-lg font-bold">Verdadero</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex items-center gap-3 rounded-2xl border-2 p-5 transition ${
          value === false
            ? "border-destructive bg-destructive/10 shadow-glow"
            : "border-border/60 bg-white/60 hover:border-destructive/40"
        }`}
      >
        <X className="h-6 w-6 text-destructive" />
        <span className="font-display text-lg font-bold">Falso</span>
      </button>
    </div>
  );
}

function OrdenAnswer({
  opciones,
  value,
  onChange,
}: {
  opciones: string[];
  value: number[] | undefined;
  onChange: (v: number[]) => void;
}) {
  const initial = useMemo(() => value ?? opciones.map((_, i) => i), [value, opciones]);
  useEffect(() => {
    if (!value) onChange(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const order = value ?? initial;

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Ordena de más antiguo (arriba) a más reciente (abajo).
      </p>
      <ul className="space-y-2">
        {order.map((originalIdx, pos) => (
          <li
            key={originalIdx}
            className="flex items-center gap-3 rounded-2xl bg-white/70 p-3"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold text-primary-foreground">
              {pos + 1}
            </span>
            <span className="flex-1 font-medium">{opciones[originalIdx]}</span>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => move(pos, pos - 1)}
                className="rounded-md bg-white/80 p-1 hover:bg-white"
                aria-label="Subir"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(pos, pos + 1)}
                className="rounded-md bg-white/80 p-1 hover:bg-white"
                aria-label="Bajar"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultScreen({
  result,
  pruebaId,
  me,
}: {
  result: NonNullable<Awaited<ReturnType<typeof submitReto>>>;
  pruebaId: string;
  me: { nombre: string; xp?: number; monedas?: number; nivel?: number } | null;
}) {
  const perfect = result.aciertos === result.total;
  return (
    <AppShell title="¡Reto completado!" subtitle="Resultado" nav={ALUMNO_NAV} user={me}>
      <GlassPanel strong className="mx-auto max-w-xl p-8 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-brand text-primary-foreground shadow-glow">
          <Trophy className="h-8 w-8" />
        </div>
        <h2 className="font-display text-3xl font-black">
          {perfect ? "¡Perfecto!" : "¡Bien hecho!"}
        </h2>
        <p className="mt-1 text-muted-foreground">
          Has acertado {result.aciertos} de {result.total} preguntas.
        </p>

        <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3">
          <ResultStat label="XP ganado" value={`+${result.xpGanado}`} />
          <ResultStat label="Monedas" value={`+${result.monedasGanadas}`} />
          <ResultStat label="Nivel" value={result.nuevoNivel} />
        </div>

        {result.nuevasInsignias.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white/70 p-4">
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> Nuevas insignias
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {result.nuevasInsignias.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-primary-foreground"
                >
                  {c.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link
            to="/alumno/temas"
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Ver más retos
          </Link>
          <Link
            to="/alumno/reto/$pruebaId"
            params={{ pruebaId }}
            reloadDocument
            className="rounded-full glass px-5 py-2 text-sm font-semibold hover:bg-white/70"
          >
            Reintentar
          </Link>
        </div>
      </GlassPanel>
    </AppShell>
  );
}

function ResultStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-black">{value}</div>
    </div>
  );
}
