# 📚 LibroApp

App web para llevar el rastro de tus libros: lecturas, reseñas, puntuaciones, progreso,
perfil público compartible y comunidad. Modo oscuro con **temas totalmente personalizables**.

> Estado actual: **prototipo de UI navegable** con datos mock. Sin backend todavía
> (Supabase viene en la Fase 1 de implementación real).

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** con design tokens vía CSS variables (`@theme inline`)
- **lucide-react** para iconos
- Backend planificado: **Supabase** (Postgres + Auth + Storage + RLS)
- Datos de libros planificados: **Open Library API** (covers ya usan su CDN)

## Arrancar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (verificado: 14 rutas OK)
```

## Sistema de temas (el corazón de la app)

Ningún componente usa colores literales de Tailwind. **Todo** consume tokens semánticos
(`bg-surface-1`, `text-muted`, `text-primary`, `border-app`, …) que se resuelven desde
CSS variables. Cambiar un tema = reescribir variables en `:root`, sin recompilar.

- **Identidad: amaderado / estudio clásico.** Tipografía con serif literaria (Lora) para
  títulos + sans cálida (Source Sans 3) para cuerpo.
- `src/lib/themes.ts` — define los temas de la familia amaderada (Estudio Día = pergamino,
  Estudio Noche = madera oscura, Cuero, Salvia), el mapeo token→CSS-var, helpers de
  contraste WCAG y `applyTokens`. Default: **Estudio Día**.
- `src/app/globals.css` — declara las variables y las mapea a utilidades Tailwind.
- `src/components/theme/theme-provider.tsx` — carga/guarda el tema (localStorage; luego
  `users.theme_config`), aplica overrides en vivo.
- `src/components/theme/theme-script.tsx` — script pre-hidratación anti-flash.
- `/settings` — editor en vivo: color pickers + preview + validación de contraste AA/AAA.

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Landing pública |
| `/login` | Auth (decorativa en el prototipo) |
| `/home` | Feed de comunidad + "continúa leyendo" |
| `/library` | Biblioteca con estantes (por leer / leyendo / leído / DNF) |
| `/reading` | Foco de lectura actual con progreso |
| `/stats` | Dashboard de estadísticas |
| `/challenges` | Retos de lectura + logros |
| `/lists` | Listas curadas |
| `/discover` | Tendencias + reseñas destacadas |
| `/search` | Búsqueda de libros |
| `/settings` | Editor de temas |
| `/book/[id]` | Detalle de libro + reseñas |
| `/u/[username]` | Perfil público compartible (sin shell de app) |

## Roadmap (fases de implementación)

1. **Núcleo**: Supabase Auth, búsqueda Open Library real, biblioteca + reseñas persistentes.
2. **Progreso**: páginas/%, fechas, notas, citas, etiquetas.
3. **Comunidad**: perfiles públicos reales, seguir, feed, likes/comentarios.
4. **Gamificación**: retos, stats avanzadas, badges, "wrapped" anual.
5. **Social avanzado**: listas, clubes de lectura, recomendaciones, import Goodreads/CSV.

Ideas extra registradas: editor de temas compartibles a galería, mood tags, heatmap de
lectura, buddy reads, spoilers, PWA, seguimiento de sagas. (Ver el plan de la sesión.)

## Mapa de carpetas

```
src/
  app/
    (app)/            rutas con shell (sidebar + topbar + bottom-nav)
    u/[username]/     perfil público (sin shell)
    page.tsx          landing
    login/            auth
  components/
    book/             BookCover, BookCard, SpoilerText
    shell/            Sidebar, Topbar, BottomNav
    theme/            ThemeProvider, ThemeScript, ThemeSwitcher
    ui/               StarRating, ProgressBar, Badge, UserAvatar, PageHeader
  lib/
    themes.ts         sistema de temas
    types.ts          tipos de dominio (mirror del esquema Postgres futuro)
    mock-data.ts      datos de ejemplo (se reemplazan por queries Supabase)
    nav.ts            items de navegación
    utils.ts          cn()
```
