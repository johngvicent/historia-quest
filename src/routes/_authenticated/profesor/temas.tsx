import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { teacherListTemas, createTema, deleteTema } from "@/lib/teacher.functions";
import { getMyProfile } from "@/lib/quest.functions";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { PROFESOR_NAV } from "@/components/nav-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const opts = queryOptions({ queryKey: ["teacher-temas"], queryFn: () => teacherListTemas() });

export const Route = createFileRoute("/_authenticated/profesor/temas")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(opts),
      context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: () => getMyProfile() }),
    ]),
  component: TemasProfesor,
});

function TemasProfesor() {
  const { data } = useSuspenseQuery(opts);
  const { data: me } = useSuspenseQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  const qc = useQueryClient();
  const create = useServerFn(createTema);
  const del = useServerFn(deleteTema);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [periodo, setPeriodo] = useState("");

  const mut = useMutation({
    mutationFn: async () =>
      create({
        data: { titulo, descripcion, periodo, orden: (data.length ?? 0) + 1 },
      }),
    onSuccess: () => {
      toast.success("Tema creado");
      setTitulo("");
      setDescripcion("");
      setPeriodo("");
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries(),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  return (
    <AppShell title="Gestión de Temas" nav={PROFESOR_NAV} user={me.profile}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <GlassPanel strong className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Nuevo tema</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mut.mutate();
            }}
            className="space-y-3"
          >
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="periodo">Periodo (slug)</Label>
              <Input
                id="periodo"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                placeholder="p.ej. edad_media"
                required
              />
            </div>
            <div>
              <Label htmlFor="desc">Descripción</Label>
              <Textarea id="desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>
            <Button
              type="submit"
              disabled={mut.isPending}
              className="rounded-full bg-brand text-primary-foreground shadow-glow"
            >
              {mut.isPending ? "Creando…" : "Crear tema"}
            </Button>
          </form>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Temas existentes ({data.length})</h2>
          <ul className="divide-y divide-border/40">
            {data.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{t.titulo}</div>
                  <div className="text-xs text-muted-foreground">{t.periodo}</div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar "${t.titulo}"?`)) delMut.mutate(t.id);
                  }}
                  className="rounded-full p-2 text-destructive hover:bg-destructive/10"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
