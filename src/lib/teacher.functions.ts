import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

type S = SupabaseClient<Database>;

async function assertProfesor(supabase: S, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "profesor")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Solo profesores pueden realizar esta acción");
}

export const getTeacherDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const [alumnosRes, resultadosRes, temasRes, pruebasRes] = await Promise.all([
      supabase.from("profiles").select("id, nombre, xp, nivel"),
      supabase
        .from("resultados")
        .select("id, user_id, puntuacion, aciertos, total, completed_at, pruebas(titulo, tema_id, temas(titulo, periodo))")
        .order("completed_at", { ascending: false })
        .limit(20),
      supabase.from("temas").select("id, titulo"),
      supabase.from("pruebas").select("id, tema_id, titulo, dificultad"),
    ]);
    if (alumnosRes.error) throw alumnosRes.error;
    const alumnos = alumnosRes.data ?? [];
    const nombreById = new Map(alumnos.map((a) => [a.id, a.nombre]));
    const resultados = (resultadosRes.data ?? []).map((r) => ({
      ...r,
      nombreAlumno: nombreById.get(r.user_id) ?? "Alumno",
    }));
    const mediaPct =
      resultados.length > 0
        ? Math.round(
            (resultados.reduce((acc, r) => acc + (r.total > 0 ? r.aciertos / r.total : 0), 0) /
              resultados.length) *
              100,
          )
        : 0;
    return {
      totalAlumnos: alumnos.length,
      mediaPct,
      resultadosRecientes: resultados,
      temas: temasRes.data ?? [],
      pruebas: pruebasRes.data ?? [],
    };
  });

export const listAlumnos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const [profRes, rolesRes, resultadosRes] = await Promise.all([
      supabase.from("profiles").select("id, nombre, xp, nivel, monedas"),
      supabase.from("user_roles").select("user_id, role").eq("role", "alumno"),
      supabase.from("resultados").select("user_id, aciertos, total"),
    ]);
    if (profRes.error) throw profRes.error;
    const alumnoIds = new Set((rolesRes.data ?? []).map((r) => r.user_id));
    const alumnos = (profRes.data ?? []).filter((p) => alumnoIds.has(p.id));
    const stats = new Map<string, { retos: number; aciertos: number; total: number }>();
    for (const r of resultadosRes.data ?? []) {
      const s = stats.get(r.user_id) ?? { retos: 0, aciertos: 0, total: 0 };
      s.retos += 1;
      s.aciertos += r.aciertos;
      s.total += r.total;
      stats.set(r.user_id, s);
    }
    return alumnos.map((a) => ({
      ...a,
      stats: stats.get(a.id) ?? { retos: 0, aciertos: 0, total: 0 },
    }));
  });

export const teacherListTemas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const { data, error } = await supabase.from("temas").select("*").order("orden");
    if (error) throw error;
    return data ?? [];
  });

export const createTema = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; descripcion: string; periodo: string; orden: number }) =>
    z
      .object({
        titulo: z.string().min(1),
        descripcion: z.string(),
        periodo: z.string().min(1),
        orden: z.number().int().min(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const { data: row, error } = await supabase.from("temas").insert(data).select().maybeSingle();
    if (error) throw error;
    return row;
  });

export const deleteTema = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const { error } = await supabase.from("temas").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const teacherListPruebas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const { data, error } = await supabase
      .from("pruebas")
      .select("*, temas(titulo)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createPrueba = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    tema_id: string;
    titulo: string;
    descripcion: string;
    dificultad: "facil" | "medio" | "dificil";
    tiempo_estimado: number;
    xp_reward: number;
    monedas_reward: number;
  }) =>
    z
      .object({
        tema_id: z.string().uuid(),
        titulo: z.string().min(1),
        descripcion: z.string(),
        dificultad: z.enum(["facil", "medio", "dificil"]),
        tiempo_estimado: z.number().int().min(1),
        xp_reward: z.number().int().min(0),
        monedas_reward: z.number().int().min(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const { data: row, error } = await supabase.from("pruebas").insert(data).select().maybeSingle();
    if (error) throw error;
    return row;
  });

export const deletePrueba = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const { error } = await supabase.from("pruebas").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const teacherGetPrueba = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const [pRes, qRes] = await Promise.all([
      supabase.from("pruebas").select("*, temas(titulo)").eq("id", data.id).maybeSingle(),
      supabase.from("preguntas").select("*").eq("prueba_id", data.id).order("orden"),
    ]);
    if (pRes.error) throw pRes.error;
    return { prueba: pRes.data, preguntas: qRes.data ?? [] };
  });

export const addPregunta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    prueba_id: string;
    tipo: "test" | "vf" | "orden";
    enunciado: string;
    opciones: unknown;
    respuesta_correcta: unknown;
    puntos: number;
    orden: number;
  }) =>
    z
      .object({
        prueba_id: z.string().uuid(),
        tipo: z.enum(["test", "vf", "orden"]),
        enunciado: z.string().min(1),
        opciones: z.any(),
        respuesta_correcta: z.any(),
        puntos: z.number().int().min(1),
        orden: z.number().int().min(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const { data: row, error } = await supabase
      .from("preguntas")
      .insert({
        prueba_id: data.prueba_id,
        tipo: data.tipo,
        enunciado: data.enunciado,
        opciones: data.opciones as never,
        respuesta_correcta: data.respuesta_correcta as never,
        puntos: data.puntos,
        orden: data.orden,
      })
      .select()
      .maybeSingle();
    if (error) throw error;
    return row;
  });

export const deletePregunta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const { error } = await supabase.from("preguntas").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const getEstadisticas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertProfesor(supabase as unknown as S, userId);
    const { data, error } = await supabase
      .from("resultados")
      .select("aciertos, total, xp_ganado, completed_at, pruebas(titulo, temas(titulo, periodo))");
    if (error) throw error;
    return data ?? [];
  });
