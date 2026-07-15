import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { getMyProfile } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { SwipeCard } from "@/components/swipe-card";
import { ALUMNO_NAV } from "@/components/nav-items";
import { Crown, Sparkles, Trophy } from "lucide-react";

type VFQuestion = { text: string; answer: boolean };

const REYES_CATOLICOS_QUESTIONS: VFQuestion[] = [
  { text: "Isabel I de Castilla y Fernando II de Aragón se casaron en 1469.", answer: true },
  { text: "La Reconquista terminó en 1492 con la toma de Granada.", answer: true },
  { text: "Los Reyes Católicos financiaron el primer viaje de Colón a América.", answer: true },
  { text: "Fernando II de Aragón era primo segundo de Isabel I de Castilla.", answer: true },
  { text: "El matrimonio entre Isabel y Fernando unificó España inmediatamente.", answer: false },
  { text: "Isabel la Católica murió después que Fernando el Católico.", answer: false },
  { text: "La Inquisición Española fue creada en 1478.", answer: true },
  {
    text: "Los Reyes Católicos reinaron juntos sobre un único reino unificado desde el inicio.",
    answer: false,
  },
  { text: "Cristóbal Colón llegó a América el 12 de octubre de 1492.", answer: true },
  { text: "Isabel la Católica nació en Madrid.", answer: false },
];

export const Route = createFileRoute("/_authenticated/alumno/swipe/$temaId")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: () => getMyProfile() }),
  component: SwipeGamePage,
});

function SwipeGamePage() {
  const { data: me } = useSuspenseQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = REYES_CATOLICOS_QUESTIONS.length;
  const current = REYES_CATOLICOS_QUESTIONS[idx];
  const isFinished = idx >= total;

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      const chosen = direction === "right";
      const correct = chosen === current.answer;
      setAnswers((prev) => [...prev, correct]);
      setFeedback(correct ? "correct" : "wrong");
      setShowFeedback(true);

      feedbackTimer.current = setTimeout(() => {
        setShowFeedback(false);
        setFeedback(null);
        setIdx((i) => i + 1);
      }, 900);
    },
    [current],
  );

  if (isFinished) {
    return <SwipeResultScreen answers={answers} me={me.profile} />;
  }

  const correctSoFar = answers.filter(Boolean).length;

  return (
    <AppShell title="Los Reyes Católicos" subtitle="Modo Swipe" nav={ALUMNO_NAV} user={me.profile}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {idx + 1} de {total}
        </span>
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          {correctSoFar} correctas
        </span>
      </div>
      <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-white/60">
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${(idx / total) * 100}%` }}
        />
      </div>

      <div className="mx-auto max-w-lg">
        <SwipeCard onSwipe={handleSwipe} disabled={showFeedback}>
          <GlassPanel strong className="relative overflow-hidden p-8 sm:p-10">
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Crown className="h-4 w-4 text-amber-500" />
              <span>Verdadero o Falso</span>
            </div>
            <h2 className="font-display text-xl font-black leading-snug sm:text-2xl">
              {current.text}
            </h2>

            <div className="mt-8 flex items-center justify-between text-sm font-semibold text-muted-foreground">
              <span className="flex items-center gap-1 text-destructive">Falso</span>
              <span className="flex items-center gap-1 text-success">Verdadero</span>
            </div>
          </GlassPanel>
        </SwipeCard>

        {showFeedback && (
          <div className="mt-6 text-center" style={{ animation: "pop-in 0.2s ease-out" }}>
            {feedback === "correct" ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-success/15 px-5 py-2 text-sm font-bold text-success">
                <Sparkles className="h-4 w-4" /> ¡Correcto!
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-destructive/15 px-5 py-2 text-sm font-bold text-destructive">
                Incorrecto
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => handleSwipe("left")}
            disabled={showFeedback}
            className="flex items-center gap-2 rounded-full border-2 border-destructive/30 bg-destructive/10 px-5 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/20 disabled:opacity-40"
          >
            Falso
          </button>
          <button
            type="button"
            onClick={() => handleSwipe("right")}
            disabled={showFeedback}
            className="flex items-center gap-2 rounded-full border-2 border-success/30 bg-success/10 px-5 py-2.5 text-sm font-semibold text-success transition hover:bg-success/20 disabled:opacity-40"
          >
            Verdadero
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function SwipeResultScreen({
  answers,
  me,
}: {
  answers: boolean[];
  me: { nombre: string; xp?: number; monedas?: number; nivel?: number } | null;
}) {
  const total = REYES_CATOLICOS_QUESTIONS.length;
  const aciertos = answers.filter(Boolean).length;
  const pct = aciertos / total;
  const xpGanado = Math.round(100 * pct) + (pct === 1 ? 20 : 0);
  const monedasGanadas = Math.round(50 * pct) + (pct === 1 ? 10 : 0);
  const perfect = aciertos === total;

  return (
    <AppShell title="¡Reto completado!" subtitle="Resultado" nav={ALUMNO_NAV} user={me}>
      <GlassPanel strong className="mx-auto max-w-xl p-8 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-brand text-primary-foreground shadow-glow">
          <Trophy className="h-8 w-8" />
        </div>
        <h2 className="font-display text-3xl font-black">
          {perfect ? "¡Perfecto!" : aciertos >= 7 ? "¡Muy bien!" : "Sigue practicando"}
        </h2>
        <p className="mt-1 text-muted-foreground">
          Has acertado {aciertos} de {total} preguntas sobre los Reyes Católicos.
        </p>

        <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3">
          <ResultStat label="XP ganado" value={`+${xpGanado}`} />
          <ResultStat label="Monedas" value={`+${monedasGanadas}`} />
          <ResultStat label="Aciertos" value={`${aciertos}/${total}`} />
        </div>

        <div className="mt-6 space-y-2 text-left">
          {REYES_CATOLICOS_QUESTIONS.map((q, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-2xl p-3 text-sm ${
                answers[i] ? "bg-success/10" : "bg-destructive/10"
              }`}
            >
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white ${
                  answers[i] ? "bg-success" : "bg-destructive"
                }`}
              >
                {i + 1}
              </span>
              <span className="leading-tight">{q.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link
            to="/alumno/temas/$temaId"
            params={{ temaId: "22222222-2222-2222-2222-222222222222" }}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Volver a temas
          </Link>
          <Link
            to="/alumno/swipe/$temaId"
            params={{ temaId: "22222222-2222-2222-2222-222222222222" }}
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
