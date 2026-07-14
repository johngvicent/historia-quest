import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { teacherGetPrueba, addPregunta, deletePregunta } from "@/lib/teacher.functions";
import { getMyProfile } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { PROFESOR_NAV } from "@/components/nav-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { TIPO_LABEL } from "@/lib/gamification";

export const Route = createFileRoute("/_authenticated/profesor/pruebas/$pruebaId")({
  loader: ({ params, context }) => {
    const opts = queryOptions({
      queryKey: ["teacher-prueba", params.pruebaId],
      queryFn: () => teacherGetPrueba({ data: { id: params.pruebaId } }),
    });
    return Promise.all([
      context.queryClient.ensureQueryData(opts),
      context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: () => getMyProfile() }),
    ]);
  },
  component: EditorPrueba,
});

type Tipo = "test" | "vf" | "orden";

function EditorPrueba() {
  const { pruebaId } = Route.useParams();
  const opts = queryOptions({
    queryKey: ["teacher-prueba", pruebaId],
    queryFn: () => teacherGetPrueba({ data: { id: pruebaId } }),
  });
  const { data } = useSuspenseQuery(opts);
  const { data: me } = useSuspenseQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  const qc = useQueryClient();
  const add = useServerFn(addPregunta);
  const del = useServerFn(deletePregunta);

  const [tipo, setTipo] = useState<Tipo>("test");
  const [enunciado, setEnunciado] = useState("");
  const [opciones, setOpciones] = useState("");
  const [correcta, setCorrecta] = useState("");
  const [puntos, setPuntos] = useState(10);

  const nextOrden = (data.preguntas.at(-1)?.orden ?? 0) + 1;

  const mut = useMutation({
    mutationFn: async () => {
      let opts_: unknown = [];
      let resp: unknown;
      if (tipo === "test") {
        opts_ = opciones.split("\n").map((s) => s.trim()).filter(Boolean);
        resp = Number(correcta);
      } else if (tipo === "vf") {
        opts_ = [];
        resp = correcta.trim().toLowerCase() === "true" || correcta.trim() === "v";
      } else {
        opts_ = opciones.split("\n").map((s) => s.trim()).filter(Boolean);
        resp = (opts_ as string[]).map((_, i) => i); // por defecto orden correcto = ingresado
      }
      return add({
        data: {
          prueba_id: pruebaId,
          tipo,
          enunciado,
          opciones: opts_,
          respuesta_correcta: resp,
          puntos,
          orden: nextOrden,
        },
      });
    },
    onSuccess: () => {
      toast.success("Pregunta añadida");
      setEnunciado("");
      setOpciones("");
      setCorrecta("");
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries(),
  });

  return (
    <AppShell
      title={data.prueba?.titulo ?? "Prueba"}
      subtitle="Editor de preguntas"
      nav={PROFESOR_NAV}
      user={me.profile}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <GlassPanel strong className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Nueva pregunta</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mut.mutate();
            }}
            className="space-y-3"
          >
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as Tipo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="vf">Verdadero/Falso</SelectItem>
                  <SelectItem value="orden">Orden cronológico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Enunciado</Label>
              <Textarea value={enunciado} onChange={(e) => setEnunciado(e.target.value)} required />
            </div>
            {tipo !== "vf" && (
              <div>
                <Label>{tipo === "orden" ? "Elementos (en orden correcto, uno por línea)" : "Opciones (una por línea)"}</Label>
                <Textarea
                  value={opciones}
                  onChange={(e) => setOpciones(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            )}
            {tipo === "test" && (
              <div>
                <Label>Índice de opción correcta (empieza en 0)</Label>
                <Input
                  type="number"
                  min={0}
                  value={correcta}
                  onChange={(e) => setCorrecta(e.target.value)}
                  required
                />
              </div>
            )}
            {tipo === "vf" && (
              <div>
                <Label>Respuesta correcta</Label>
                <Select value={correcta} onValueChange={setCorrecta}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Verdadero</SelectItem>
                    <SelectItem value="false">Falso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Puntos</Label>
              <Input
                type="number"
                min={1}
                value={puntos}
                onChange={(e) => setPuntos(Number(e.target.value))}
              />
            </div>
            <Button
              type="submit"
              disabled={mut.isPending}
              className="rounded-full bg-brand text-primary-foreground shadow-glow"
            >
              Añadir pregunta
            </Button>
          </form>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">
            Preguntas ({data.preguntas.length})
          </h2>
          <ul className="space-y-3">
            {data.preguntas.map((p, i) => (
              <li key={p.id} className="rounded-2xl bg-white/60 p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-primary">
                    #{i + 1} · {TIPO_LABEL[p.tipo]}
                  </span>
                  <button
                    onClick={() => delMut.mutate(p.id)}
                    className="rounded-full p-1.5 text-destructive hover:bg-destructive/10"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-sm font-semibold">{p.enunciado}</div>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
