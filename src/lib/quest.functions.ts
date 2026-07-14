import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { nivelPorXp } from "@/lib/gamification";
import { z } from "zod";

// ============ Rol y perfil ============
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    if (profileRes.error) throw profileRes.error;
    if (rolesRes.error) throw rolesRes.error;
    const roles = (rolesRes.data ?? []).map((r) => r.role);
    return { profile: profileRes.data, roles };
  });

// ============ ALUMNO ============
export const getStudentDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileRes, resultadosRes, insigniasRes, temasRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("resultados")
        .select("id, prueba_id, puntuacion, aciertos, total, xp_ganado, completed_at, pruebas(titulo, tema_id)")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(10),
      supabase
        .from("user_insignias")
        .select("insignia_id, obtained_at, insignias(codigo, nombre, descripcion, icono)")
        .eq("user_id", userId),
      supabase.from("temas").select("id, titulo, periodo").order("orden"),
    ]);
    if (profileRes.error) throw profileRes.error;
    return {
      profile: profileRes.data,
      resultados: resultadosRes.data ?? [],
      insignias: insigniasRes.data ?? [],
      temas: temasRes.data ?? [],
    };
  });

export const listTemas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [temasRes, pruebasRes, resultadosRes] = await Promise.all([
      supabase.from("temas").select("*").order("orden"),
      supabase.from("pruebas").select("id, tema_id, dificultad"),
      supabase.from("resultados").select("prueba_id, puntuacion, total").eq("user_id", userId),
    ]);
    if (temasRes.error) throw temasRes.error;
    return {
      temas: temasRes.data ?? [],
      pruebas: pruebasRes.data ?? [],
      resultados: resultadosRes.data ?? [],
    };
  });

export const getTema = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { temaId: string }) => z.object({ temaId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [temaRes, pruebasRes, resultadosRes] = await Promise.all([
      supabase.from("temas").select("*").eq("id", data.temaId).maybeSingle(),
      supabase.from("pruebas").select("*").eq("tema_id", data.temaId),
      supabase.from("resultados").select("prueba_id, puntuacion, aciertos, total, completed_at").eq("user_id", userId),
    ]);
    if (temaRes.error) throw temaRes.error;
    if (!temaRes.data) throw new Error("Tema no encontrado");
    return {
      tema: temaRes.data,
      pruebas: pruebasRes.data ?? [],
      resultados: resultadosRes.data ?? [],
    };
  });

export const getPrueba = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { pruebaId: string }) => z.object({ pruebaId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [pruebaRes, preguntasRes] = await Promise.all([
      supabase.from("pruebas").select("*, temas(titulo, periodo)").eq("id", data.pruebaId).maybeSingle(),
      supabase
        .from("preguntas")
        .select("id, tipo, enunciado, opciones, orden, puntos")
        .eq("prueba_id", data.pruebaId)
        .order("orden"),
    ]);
    if (pruebaRes.error) throw pruebaRes.error;
    if (!pruebaRes.data) throw new Error("Prueba no encontrada");
    // NOTA: no exponemos respuesta_correcta al cliente
    return { prueba: pruebaRes.data, preguntas: preguntasRes.data ?? [] };
  });

const RespuestaSchema = z.object({
  preguntaId: z.string().uuid(),
  valor: z.any(),
});

export const submitReto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { pruebaId: string; respuestas: Array<{ preguntaId: string; valor: unknown }>; tiempoSeg: number }) =>
    z
      .object({
        pruebaId: z.string().uuid(),
        respuestas: z.array(RespuestaSchema),
        tiempoSeg: z.number().int().min(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const [pruebaRes, preguntasRes, profileRes] = await Promise.all([
      supabase.from("pruebas").select("*").eq("id", data.pruebaId).maybeSingle(),
      supabase.from("preguntas").select("id, tipo, respuesta_correcta, puntos").eq("prueba_id", data.pruebaId),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ]);
    if (pruebaRes.error || !pruebaRes.data) throw new Error("Prueba no encontrada");
    if (preguntasRes.error) throw preguntasRes.error;
    if (profileRes.error || !profileRes.data) throw new Error("Perfil no encontrado");

    const prueba = pruebaRes.data;
    const preguntas = preguntasRes.data ?? [];
    const respuestasMap = new Map(data.respuestas.map((r) => [r.preguntaId, r.valor]));

    let aciertos = 0;
    let puntuacion = 0;
    const total = preguntas.length;

    for (const p of preguntas) {
      const dada = respuestasMap.get(p.id);
      const correcta = p.respuesta_correcta;
      let ok = false;
      if (p.tipo === "test") {
        ok = Number(dada) === Number(correcta);
      } else if (p.tipo === "vf") {
        ok = Boolean(dada) === Boolean(correcta);
      } else if (p.tipo === "orden") {
        ok =
          Array.isArray(dada) &&
          Array.isArray(correcta) &&
          dada.length === correcta.length &&
          dada.every((v: unknown, i: number) => Number(v) === Number((correcta as unknown[])[i]));
      }
      if (ok) {
        aciertos += 1;
        puntuacion += p.puntos ?? 10;
      }
    }

    const porcentaje = total > 0 ? aciertos / total : 0;
    const xpGanado = Math.round(prueba.xp_reward * porcentaje) + (porcentaje === 1 ? 20 : 0);
    const monedasGanadas = Math.round(prueba.monedas_reward * porcentaje) + (porcentaje === 1 ? 10 : 0);

    // Guardar resultado
    const { error: insErr } = await supabase.from("resultados").insert({
      user_id: userId,
      prueba_id: data.pruebaId,
      puntuacion,
      aciertos,
      total,
      tiempo_seg: data.tiempoSeg,
      xp_ganado: xpGanado,
      monedas_ganadas: monedasGanadas,
    });
    if (insErr) throw insErr;

    const nuevoXp = (profileRes.data.xp ?? 0) + xpGanado;
    const nuevoNivel = nivelPorXp(nuevoXp);
    const nuevasMonedas = (profileRes.data.monedas ?? 0) + monedasGanadas;

    const { error: updErr } = await supabase
      .from("profiles")
      .update({ xp: nuevoXp, nivel: nuevoNivel, monedas: nuevasMonedas })
      .eq("id", userId);
    if (updErr) throw updErr;

    // Evaluar insignias
    const nuevasInsignias: string[] = [];
    const { data: insigniasAll } = await supabase.from("insignias").select("id, codigo");
    const { data: yaTiene } = await supabase.from("user_insignias").select("insignia_id").eq("user_id", userId);
    const yaTieneSet = new Set((yaTiene ?? []).map((x) => x.insignia_id));
    const byCodigo = new Map((insigniasAll ?? []).map((i) => [i.codigo, i.id]));

    async function otorgar(codigo: string) {
      const id = byCodigo.get(codigo);
      if (!id || yaTieneSet.has(id)) return;
      const { error } = await supabase.from("user_insignias").insert({ user_id: userId, insignia_id: id });
      if (!error) nuevasInsignias.push(codigo);
    }

    // Primera victoria (algún resultado existente)
    const { count } = await supabase
      .from("resultados")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) >= 1) await otorgar("primera_victoria");
    if (porcentaje === 1) await otorgar("perfeccionista");
    if (nuevoNivel >= 5) await otorgar("nivel_5");
    if (nuevoNivel >= 10) await otorgar("nivel_10");
    if (nuevasMonedas >= 500) await otorgar("coleccionista");

    // Explorador: 3 periodos distintos
    const { data: allRes } = await supabase
      .from("resultados")
      .select("pruebas!inner(tema_id)")
      .eq("user_id", userId);
    const temasDistintos = new Set(
      (allRes ?? [])
        .map((r) => (r as { pruebas: { tema_id: string } | null }).pruebas?.tema_id)
        .filter(Boolean),
    );
    if (temasDistintos.size >= 3) await otorgar("explorador");

    return { aciertos, total, puntuacion, xpGanado, monedasGanadas, nuevoNivel, nuevasInsignias };
  });

export const listRanking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nombre, xp, nivel, monedas")
      .order("xp", { ascending: false })
      .limit(50);
    if (error) throw error;
    return { ranking: data ?? [] };
  });

export const listAllInsignias = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [allRes, mineRes] = await Promise.all([
      supabase.from("insignias").select("*"),
      supabase.from("user_insignias").select("insignia_id, obtained_at").eq("user_id", userId),
    ]);
    if (allRes.error) throw allRes.error;
    return { insignias: allRes.data ?? [], obtenidas: mineRes.data ?? [] };
  });
