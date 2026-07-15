# Hispania Quest

Aplicación web educativa que gamifica el aprendizaje de la Historia de España para alumnado de ESO y Bachillerato.

## Objetivo

Convertir cada clase de Historia en una experiencia de juego: retos, experiencia (XP), insignias, niveles y ranking motivan al alumnado mientras se mantiene el rigor histórico.

## Roles

- **Alumno** — realiza retos, gana XP, desbloquea insignias, sigue su progreso y compite en el ranking.
- **Profesor** — crea y edita actividades, corrige respuestas abiertas, ve estadísticas y gestiona alumnos.

## Stack tecnológico

| Tecnología           | Uso                               |
| -------------------- | --------------------------------- |
| React 19             | UI                                |
| TypeScript 5         | Tipado estricto                   |
| Vite 8               | Build tool                        |
| TanStack Start       | SSR y server functions            |
| TanStack Router      | Enrutado basado en archivos       |
| TanStack React Query | Caché y estado del servidor       |
| Tailwind CSS 4       | Estilos                           |
| shadcn/ui + Radix UI | Componentes accesibles            |
| Supabase             | Autenticación, base de datos, RLS |
| Zod                  | Validación de esquemas            |
| React Hook Form      | Formularios                       |
| Lucide React         | Iconos                            |
| Recharts             | Gráficas (profesor)               |

## Scripts

```bash
bun dev          # Inicia servidor de desarrollo
bun run build    # Build de producción
bun run preview  # Previsualiza build
bun run lint     # ESLint
bun run format   # Prettier
```

## Estructura del proyecto

```
src/
├── assets/                # Imágenes y assets
├── components/
│   ├── ui/                # shadcn/ui (46 componentes)
│   ├── app-shell.tsx      # Layout autenticado
│   ├── glass-panel.tsx    # Contenedor glassmorphism
│   ├── swipe-card.tsx     # Tarjeta swipeable (Tinder-style)
│   └── xp-bar.tsx         # Barra de progreso de nivel
├── integrations/
│   └── supabase/          # Cliente, tipos, middleware
├── lib/
│   ├── quest.functions.ts # Server functions (alumno)
│   ├── teacher.functions.ts # Server functions (profesor)
│   └── gamification.ts    # Niveles, XP, gradientes
├── routes/
│   ├── __root.tsx         # Layout raíz, SEO, fuentes
│   ├── index.tsx          # Landing page
│   ├── auth.tsx           # Login / registro
│   └── _authenticated/
│       ├── dashboard.tsx  # Redirección por rol
│       ├── alumno/
│       │   ├── index.tsx  # Panel del alumno
│       │   ├── temas.tsx  # Lista de periodos históricos
│       │   ├── temas.$temaId.tsx  # Detalle del tema
│       │   ├── swipe.$temaId.tsx  # Juego swipe V/F
│       │   ├── reto.$pruebaId.tsx # Reto tradicional
│       │   ├── ranking.tsx # Clasificación global
│       │   └── insignias.tsx # Colección de logros
│       └── profesor/
│           ├── index.tsx  # Panel del profesor
│           ├── temas.tsx  # CRUD de temas
│           ├── pruebas.tsx # CRUD de pruebas
│           ├── pruebas.$pruebaId.tsx # Editor de preguntas
│           ├── estadisticas.tsx # Gráficas de rendimiento
│           └── alumnos.tsx # Tabla de estudiantes
└── styles.css             # Design system + animaciones
```

## Gamificación

- **XP** — experiencia ganada al completar retos
- **Niveles** — 11 niveles progresivos (0 → 5500 XP)
- **Monedas** — recompensa adicional canjeable
- **Insignias** — logros por hitos (primera victoria, perfeccionista, niveles, etc.)
- **Ranking** — clasificación global por XP
- **Rachas, desafíos y misiones** — próximamente

## Periodos históricos

Prehistoria · Hispania prerromana · Romanización · Reino Visigodo · Al-Ándalus · Reconquista · Reyes Católicos · Descubrimiento de América · Imperio Español · Siglo de Oro · Guerra de Sucesión · Ilustración · Guerra de Independencia · Constitución de Cádiz · Restauración · Segunda República · Guerra Civil · Franquismo · Transición · Democracia

## Tipos de preguntas

- **Test** — opción múltiple (A/B/C/D)
- **Verdadero/Falso** — respuesta binaria
- **Orden cronológico** — ordenar eventos
- **Modo Swipe** — deslizar estilo Tinder (V/F)
- Completar, relacionar conceptos y respuesta abierta — próximamente

## Diseño

Inspirado en Duolingo, Kahoot y Quizizz. Estilo moderno, minimalista, glassmorphism, animaciones suaves y colores vivos. Tipografía: Poppins (títulos) + Inter (cuerpo).

## Licencia

Uso educativo interno.
