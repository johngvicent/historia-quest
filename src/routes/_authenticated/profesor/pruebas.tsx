import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  teacherListPruebas,
  teacherListTemas,
  createPrueba,
  deletePrueba,
} from "@/lib/teacher.functions";
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
import { Pencil, Trash2 } from "lucide-react";
import { DIFICULTAD_COLOR, DIFICULTAD_LABEL } from "@/lib/gamification";

const pruebasOpts = queryOptions({ queryKey: ["teacher-pruebas"], queryFn: () => teacherListPruebas() });
const temasOpts = queryOptions({ queryKey: ["teacher-temas"], queryFn: () => teacherListTemas() });

export const Route = createFileRoute("/_authenticated/profesor/pruebas")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(pruebasOpts),
      context.queryClient.ensureQueryData(temasOpts),
      context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: () => getMyProfile() }),
    ]),
  component: PruebasProfesor,
});

function PruebasProfesor() {
  const { data: pruebas } = useSuspenseQuery(pruebasOpts);
  const { data: temas } = useSuspenseQuery(temasOpts);
  const { data: me } = useSuspenseQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  const qc = useQueryClient();
  const create = useServerFn(createPrueba);
  const del = useServerFn(deletePrueba);

  const [temaId, setTemaId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [dificultad, setDificultad] = useState<"facil" | "medio" | "dificil">("facil");
  const [tiempo, setTiempo] = useState(5);
  const [xp, setXp] = useState(60);
  const [monedas, setMonedas] = useState(15);

  const mut = useMutation({
    mutationFn: () =>
      create({
        data: {
          tema_id: temaId,
          titulo,
          descripcion,
          dificultad,
          tiempo_estimado: tiempo,
          xp_reward: xp,
          monedas_reward: monedas,
        },
      }),
    onSuccess: () => {
      toast.success("Prueba creada");
      setTitulo("");
      setDescripcion("");
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries(),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  return (
    <AppShell title="Gestión de Pruebas" nav={PROFESOR_NAV} user={me.profile}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <GlassPanel strong className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Nueva prueba</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!temaId) return toast.error("Selecciona un tema");
              mut.mutate();
            }}
            className="space-y-3"
          >
            <div>
              <Label>Tema</Label>
              <Select value={temaId} onValueChange={setTemaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tema" />
                </SelectTrigger>
                <SelectContent>
                  {temas.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="desc">Descripción</Label>
              <Textarea id="desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dificultad</Label>
                <Select value={dificultad} onValueChange={(v) => setDificultad(v as typeof dificultad)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="t">Tiempo (min)</Label>
                <Input
                  id="t"
                  type="number"
                  min={1}
                  value={tiempo}
                  onChange={(e) => setTiempo(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="xp">XP</Label>
                <Input
                  id="xp"
                  type="number"
                  min={0}
                  value={xp}
                  onChange={(e) => setXp(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="m">Monedas</Label>
                <Input
                  id="m"
                  type="number"
                  min={0}
                  value={monedas}
                  onChange={(e) => setMonedas(Number(e.target.value))}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={mut.isPending}
              className="rounded-full bg-brand text-primary-foreground shadow-glow"
            >
              {mut.isPending ? "Creando…" : "Crear prueba"}
            </Button>
          </form>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Pruebas ({pruebas.length})</h2>
          <ul className="divide-y divide-border/40">
            {pruebas.map((p) => {
              const tema = (p as { temas: { titulo: string } | null }).temas?.titulo;
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.titulo}</div>
                    <div className="text-xs text-muted-foreground">{tema}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`hidden sm:inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${DIFICULTAD_COLOR[p.dificultad]}`}
                    >
                      {DIFICULTAD_LABEL[p.dificultad]}
                    </span>
                    <Link
                      to="/profesor/pruebas/$pruebaId"
                      params={{ pruebaId: p.id }}
                      className="rounded-full p-2 text-primary hover:bg-primary/10"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar "${p.titulo}"?`)) delMut.mutate(p.id);
                      }}
                      className="rounded-full p-2 text-destructive hover:bg-destructive/10"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
