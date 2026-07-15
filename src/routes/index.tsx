import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassPanel } from "@/components/glass-panel";
import {
  Award,
  BookOpen,
  Compass,
  GraduationCap,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Nav */}
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-primary-foreground shadow-glow">
            <span className="text-lg font-black">HQ</span>
          </div>
          <span className="font-display text-lg font-black">Hispania Quest</span>
        </div>
        <Link
          to="/auth"
          className="rounded-full glass px-5 py-2 text-sm font-semibold text-foreground hover:bg-white/70"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
      <section className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-semibold text-foreground/80">
            <Sparkles className="h-3.5 w-3.5" /> Aprende Historia de España jugando
          </div>
          <h1 className="text-4xl font-black leading-[1.05] sm:text-5xl md:text-6xl">
            Convierte cada clase en una <span className="text-brand">aventura</span> por la historia.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Retos, XP, insignias y rankings para que tu alumnado viva la Prehistoria, los
            Reyes Católicos, la Guerra Civil o la Transición como nunca antes.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
            >
              <GraduationCap className="h-5 w-5" /> Soy Alumno
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full glass-strong px-6 py-3 text-base font-semibold text-foreground hover:bg-white/80"
            >
              <ShieldCheck className="h-5 w-5" /> Soy Profesor
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm">
            {[
              { icon: BookOpen, label: "+12 periodos históricos" },
              { icon: Trophy, label: "Ranking en vivo" },
              { icon: Award, label: "Sistema de insignias" },
            ].map((it) => (
              <div key={it.label} className="flex items-center gap-2 text-muted-foreground">
                <it.icon className="h-4 w-4 text-primary" /> {it.label}
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-brand opacity-20 blur-3xl" />
          <GlassPanel strong className="relative overflow-hidden p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Reto en curso</div>
                <div className="font-display text-lg font-bold">Los Reyes Católicos</div>
              </div>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                +90 XP
              </span>
            </div>

            <div className="space-y-3">
              <QuestionMock
                text="¿En qué año se descubrió América?"
                options={["1489", "1492", "1500", "1478"]}
                correct={1}
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: Trophy, label: "Rank", value: "#4" },
                { icon: Sparkles, label: "XP", value: "1.240" },
                { icon: Rocket, label: "Nivel", value: "5" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/60 p-3 text-center">
                  <s.icon className="mx-auto mb-1 h-4 w-4 text-primary" />
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="font-display font-bold">{s.value}</div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mt-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-black sm:text-4xl">
            Diseñado para el aula moderna
          </h2>
          <p className="mt-2 text-muted-foreground">
            Todo lo que necesitas para gamificar tu asignatura de Historia.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <GlassPanel key={f.title} className="p-6">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-glow">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </GlassPanel>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 mb-8">
        <GlassPanel strong className="overflow-hidden p-10 text-center">
          <h2 className="font-display text-3xl font-black sm:text-4xl">
            Empieza tu <span className="text-brand">viaje en el tiempo</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Crea tu cuenta gratis y elige tu rol para acceder al panel completo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-brand px-6 py-3 text-base font-semibold text-primary-foreground shadow-glow"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </GlassPanel>
      </section>

      <footer className="pb-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Hispania Quest · Hecho para aprender jugando.
      </footer>
    </main>
  );
}

const FEATURES = [
  {
    icon: Compass,
    title: "12 periodos históricos",
    desc: "Desde la Prehistoria hasta la Transición Democrática, cubre el temario con retos temáticos.",
  },
  {
    icon: Sparkles,
    title: "Gamificación completa",
    desc: "XP, niveles, monedas, insignias y ranking mantienen la motivación del alumnado.",
  },
  {
    icon: BookOpen,
    title: "Panel del profesor",
    desc: "Crea pruebas, edita preguntas y sigue el progreso de cada alumno en tiempo real.",
  },
  {
    icon: ShieldCheck,
    title: "Roles separados",
    desc: "Autenticación diferenciada para alumnado y profesorado, cada uno con su propio panel.",
  },
  {
    icon: Trophy,
    title: "Ranking global",
    desc: "Fomenta la sana competencia con clasificaciones actualizadas al instante.",
  },
  {
    icon: Award,
    title: "Insignias desbloqueables",
    desc: "Recompensa la constancia y el dominio de cada periodo histórico.",
  },
];

function QuestionMock({ text, options, correct }: { text: string; options: string[]; correct: number }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4">
      <div className="mb-3 text-sm font-semibold">{text}</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o, i) => (
          <div
            key={o}
            className={`rounded-xl border px-3 py-2 text-sm ${
              i === correct
                ? "border-success/40 bg-success/15 text-success font-semibold"
                : "border-border/60 bg-white/60"
            }`}
          >
            {o}
          </div>
        ))}
      </div>
    </div>
  );
}
