<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS.md

# Hispania Quest

## Descripción del proyecto

Hispania Quest es una aplicación web educativa que gamifica el aprendizaje de la Historia de España para alumnado de ESO y Bachillerato.

La aplicación dispone de dos perfiles diferenciados:

- Alumno
- Profesor

Los alumnos realizan retos, consiguen experiencia (XP), desbloquean insignias y siguen su progreso.

Los profesores crean actividades, corrigen respuestas abiertas y hacen seguimiento del aprendizaje.

El objetivo principal es aumentar la motivación del alumnado mediante mecánicas de gamificación sin perder el rigor histórico.

---

# Objetivos del proyecto

Siempre priorizar:

1. Simplicidad.
2. Facilidad de uso.
3. Diseño atractivo.
4. Código mantenible.
5. Componentes reutilizables.
6. Accesibilidad.
7. Responsive Design.
8. Escalabilidad.

---

# Stack tecnológico

Siempre utilizar:

- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Router
- Supabase
- Supabase Auth
- Supabase Database
- React Hook Form
- Zod
- Lucide Icons

No añadir librerías innecesarias.

---

# Diseño visual

Inspiración:

- Duolingo
- Kahoot
- Quizizz

Estilo:

- Moderno
- Minimalista
- Muy visual
- Espacios amplios
- Animaciones suaves
- Colores vivos

---

# Paleta recomendada

Color principal

#0B5FFF

Azul secundario

#3B82F6

Amarillo XP

#FACC15

Verde éxito

#22C55E

Rojo error

#EF4444

Gris claro

#F8FAFC

Texto

#1E293B

---

# Tipografía

Preferiblemente:

- Inter
- Poppins

Nunca utilizar más de dos familias tipográficas.

---

# Organización de carpetas

src/

components/

ui/

layout/

history/

gamification/

teacher/

student/

pages/

hooks/

services/

types/

utils/

lib/

assets/

---

# Componentes

Todos los componentes deben ser:

- pequeños
- reutilizables
- desacoplados
- tipados

Evitar componentes de más de 250 líneas.

---

# Autenticación

Dos roles:

## Alumno

Puede:

- iniciar sesión
- realizar retos
- consultar progreso
- consultar ranking
- conseguir insignias

Nunca puede modificar contenido.

---

## Profesor

Puede:

- iniciar sesión
- crear actividades
- editar actividades
- eliminar actividades
- corregir respuestas abiertas
- ver estadísticas
- gestionar alumnos

Nunca acceder mediante rutas de alumno.

---

# Gamificación

La aplicación gira alrededor de:

XP

Niveles

Logros

Insignias

Ranking

Rachas

Desafíos

Misiones

Nunca eliminar estas mecánicas.

Toda nueva funcionalidad debería integrarse dentro del sistema de gamificación.

---

# Historia de España

Los contenidos estarán organizados por etapas:

- Prehistoria
- Hispania prerromana
- Romanización
- Reino Visigodo
- Al-Ándalus
- Reconquista
- Reyes Católicos
- Descubrimiento de América
- Imperio Español
- Siglo de Oro
- Guerra de Sucesión
- Ilustración
- Guerra de Independencia
- Constitución de Cádiz
- Restauración
- Segunda República
- Guerra Civil
- Franquismo
- Transición
- Democracia

Los contenidos deben ser cronológicos.

---

# Tipos de preguntas

Admitir:

- Test
- Verdadero/Falso
- Completar
- Relacionar conceptos
- Orden cronológico
- Respuesta abierta

Siempre permitir ampliar nuevos tipos.

---

# Base de datos

Mantener la estructura normalizada.

Tablas principales:

profiles

courses

topics

lessons

questions

answers

attempts

badges

rewards

xp_logs

leaderboards

teacher_feedback

No duplicar información.

---

# UI/UX

Priorizar:

feedback inmediato

animaciones cortas

botones grandes

barra de progreso

indicadores visuales

transiciones suaves

---

# Accesibilidad

Cumplir WCAG AA.

Todo formulario debe incluir:

labels

focus visible

contraste suficiente

navegación mediante teclado

mensajes de error claros

---

# Código

Siempre:

TypeScript estricto

tipado completo

sin any

sin código duplicado

sin lógica en componentes grandes

crear hooks reutilizables

---

# Rendimiento

Lazy loading.

Code Splitting.

Memoización cuando sea necesaria.

Optimizar imágenes.

No realizar consultas repetidas a Supabase.

---

# Seguridad

Aplicar Row Level Security.

Validar permisos por rol.

Nunca confiar únicamente en el frontend.

Validar siempre en Supabase.

---

# Convenciones

Nombres en inglés para:

variables

componentes

funciones

tablas

Comentarios únicamente cuando aporten valor.

---

# Al crear nuevas funcionalidades

Siempre preguntarse:

¿Aporta valor educativo?

¿Aumenta la motivación?

¿Mantiene la simplicidad?

¿Puede reutilizarse?

¿Respeta la arquitectura existente?

Si alguna respuesta es negativa, replantear la implementación.

---

# Filosofía del proyecto

Cada pantalla debe hacer que aprender Historia de España sea más parecido a jugar que a memorizar.

Toda nueva funcionalidad debe contribuir a esa experiencia.
