
# Historia Quest — Plan del MVP

Mini app web para gamificar el aprendizaje de Historia de España, con roles Alumno y Profesor, backend en Lovable Cloud (Supabase) y estética moderna glass con paleta naranja/cian.

## Alcance de esta primera versión

Incluido:
- Auth email/contraseña (alumno y profesor) con rol asignado en el registro.
- Landing con CTAs "Soy Alumno" / "Soy Profesor".
- Dashboard Alumno: XP, nivel, monedas, insignias, progreso, ranking, misiones.
- Lista de temas históricos y pantalla de retos por tema.
- Motor de preguntas con 3 tipos: **Test**, **Verdadero/Falso**, **Orden cronológico**.
- Sistema de gamificación: XP, niveles (fórmula por umbrales), monedas, insignias automáticas, ranking global.
- Dashboard Profesor: resumen (nº alumnos, media, actividad), CRUD de temas, CRUD de pruebas/preguntas, estadísticas básicas con gráficos.
- Contenido precargado: 4 temas (Prehistoria, Reyes Católicos, Guerra Civil, Transición) con 5-10 preguntas cada uno.
- Diseño responsive, glass effect, ilustraciones.

Fuera de este MVP (queda para siguiente iteración): preguntas abiertas + corrección manual, relacionar conceptos, completar texto, rachas diarias, recompensas canjeables por monedas, ranking semanal separado.

## Diseño visual

- Paleta con tokens semánticos en `src/styles.css` (oklch):
  - Primary: naranja cálido (~oklch(0.75 0.17 55))
  - Secondary: cian (~oklch(0.78 0.13 210))
  - Acentos gradientes naranja→cian para hero, botones destacados, barras de progreso.
  - Fondos claros con blobs difuminados detrás de tarjetas glass.
- Glass: `bg-white/40 backdrop-blur-xl border border-white/50` sobre fondos con gradiente + blobs.
- Ilustraciones generadas para: hero de landing, badges/insignias, portadas de los 4 temas históricos, avatar por defecto.
- Tipografía: Poppins (headings) + Inter (cuerpo), cargadas vía `<link>` en `__root.tsx`.
- Componentes shadcn como base; variantes propias "quest" para botones y tarjetas.

## Arquitectura

Rutas (`src/routes/`):
```
__root.tsx
index.tsx                      → Landing
auth.tsx                       → Login + registro (tabs alumno/profesor)
_authenticated/
  route.tsx                    → Gate (ssr:false) → redirige a /auth
  dashboard.tsx                → Redirige según rol
  alumno/
    index.tsx                  → Dashboard alumno
    temas.tsx                  → Lista de temas
    temas.$temaId.tsx          → Retos del tema
    reto.$retoId.tsx           → Ejecución de la prueba
    ranking.tsx
    insignias.tsx
  profesor/
    index.tsx                  → Dashboard profesor
    temas.tsx                  → Gestión temas
    pruebas.tsx                → Gestión pruebas
    pruebas.$pruebaId.tsx      → Editor de preguntas
    estadisticas.tsx
    alumnos.tsx
```

Server functions (`src/lib/*.functions.ts`) con `requireSupabaseAuth`:
- `getStudentDashboard`, `listTemas`, `listRetosByTema`, `getReto`, `submitReto` (calcula puntuación, otorga XP/monedas, evalúa insignias).
- `listRanking`, `listInsignias`.
- Profesor: `createTema`, `updateTema`, `deleteTema`, `createPrueba`, `updatePrueba`, `addPregunta`, `getEstadisticas`, `listAlumnos`.
- Verificación de rol dentro de cada fn de profesor con `has_role`.

## Base de datos (Supabase / Lovable Cloud)

Enums: `app_role` (`alumno`, `profesor`), `pregunta_tipo` (`test`, `vf`, `orden`), `dificultad` (`facil`, `medio`, `dificil`).

Tablas (todas con GRANTs + RLS):
- `profiles` (id → auth.users, nombre, avatar_url, xp, nivel, monedas).
- `user_roles` (user_id, role) — patrón seguro con `has_role()` SECURITY DEFINER.
- `temas` (id, titulo, descripcion, periodo, orden, imagen_url).
- `pruebas` (id, tema_id, titulo, dificultad, tiempo_estimado, xp_reward, monedas_reward).
- `preguntas` (id, prueba_id, tipo, enunciado, opciones jsonb, respuesta_correcta jsonb, orden, puntos).
- `resultados` (id, user_id, prueba_id, puntuacion, aciertos, total, tiempo_seg, xp_ganado, monedas_ganadas, completed_at).
- `insignias` (id, codigo, nombre, descripcion, icono, criterio jsonb).
- `user_insignias` (user_id, insignia_id, obtained_at).
- Vista `ranking_view` (perfil + xp + nivel, ordenable).

Políticas RLS:
- Alumno: lee sus propios `profiles`, `resultados`, `user_insignias`; lee `temas`/`pruebas`/`preguntas` publicadas (sin `respuesta_correcta` desde el cliente — se filtra en la server fn).
- Profesor: CRUD completo en `temas`, `pruebas`, `preguntas`, lectura de `resultados` de todos los alumnos, lectura de `profiles`.
- `ranking_view` legible por `authenticated`.

Seeds (via migration): 4 temas con imágenes generadas, 1-2 pruebas por tema, 5-10 preguntas mezclando los 3 tipos, 6 insignias base (Primera victoria, Racha de 5 aciertos, Maestro de la Prehistoria, etc.).

## Gamificación

- XP por reto: `sum(puntos de aciertos) + bonus por completar`.
- Nivel: umbrales fijos (1: 0, 2: 100, 3: 250, 4: 500, 5: 1000, +500 por nivel).
- Monedas: `10 × nivel_dificultad + bonus perfect`.
- Insignias: evaluadas en `submitReto` (primer reto completado, 100% en una prueba, completar todos los retos de un tema, alcanzar nivel 5, etc.).
- Ranking global por XP en `/alumno/ranking` y en el widget del dashboard.

## Detalles técnicos clave

- Lovable Cloud habilitado (Supabase) — auth email/password + tabla `user_roles`, nunca en `profiles`.
- Trigger `handle_new_user` crea `profiles` + inserta rol elegido en registro.
- Gate autenticado usa el layout gestionado (`_authenticated/route.tsx`, `ssr:false`).
- Reads con TanStack Query (`ensureQueryData` en loaders + `useSuspenseQuery`).
- Mutaciones (submit reto, crear prueba) con `useMutation` + `invalidateQueries`.
- Gráficos del profesor con `recharts` (barras de aciertos por tema, línea de evolución).
- Head metadata específica por ruta pública (landing) para SEO.
- Preparado para producción: build estándar de Lovable, sin config extra.

## Pasos de implementación

1. Habilitar Lovable Cloud.
2. Migración: enums, tablas, RLS, `has_role`, trigger de nuevo usuario, seeds de temas/pruebas/preguntas/insignias.
3. Tokens de diseño (naranja/cian, glass, fuentes) en `styles.css` + `__root.tsx`.
4. Generar ilustraciones (hero landing + 4 portadas de temas + set de insignias).
5. Landing (`index.tsx`) con hero, CTAs y secciones ilustradas.
6. Página `/auth` con tabs alumno/profesor (registro + login).
7. Layout autenticado + redirección por rol desde `/dashboard`.
8. Server functions de alumno + pantallas: dashboard, temas, retos, ejecución de prueba, ranking, insignias.
9. Server functions de profesor + pantallas: dashboard, gestión temas/pruebas/preguntas, estadísticas, alumnos.
10. Componentes reutilizables (`QuestCard`, `GlassPanel`, `XPBar`, `BadgeChip`, `QuestionRunner` con sub-renderers por tipo).
11. Verificación funcional: registro alumno → completar reto → ver XP/insignia; registro profesor → crear prueba → ver estadística; responsive móvil/escritorio.

## Verificación final

- [ ] Alumno y profesor pueden registrarse e iniciar sesión con roles separados.
- [ ] Cada rol aterriza en su dashboard.
- [ ] El alumno completa una prueba y recibe XP, monedas e insignia si procede.
- [ ] El profesor crea/edita/borra prueba y ve estadísticas.
- [ ] Ranking visible para el alumno.
- [ ] Responsive OK en móvil.
- [ ] RLS activa; sin filtraciones de `respuesta_correcta` al cliente.
- [ ] Contenido precargado de los 4 temas visible tras registro.
