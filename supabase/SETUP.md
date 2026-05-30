# Setup del backend (Supabase + Vercel)

Guía paso a paso. El código ya está listo; esto es lo que **tú** haces en las consolas
(Supabase, Google, Vercel) porque requieren tus cuentas.

## 1. Crear el proyecto en Supabase (gratis, sin tarjeta)

1. Entra a https://supabase.com → **New project**.
2. Elige nombre, región cercana (ej. `East US`) y una **contraseña de DB** (guárdala).
3. Espera ~2 min a que se aprovisione.

## 2. Cargar el esquema

1. En el panel del proyecto → **SQL Editor** → **New query**.
2. Pega y ejecuta `supabase/migrations/0001_initial_schema.sql` (Run).
3. Repite con `supabase/migrations/0002_rls_policies.sql`.
4. En **Table Editor** deberías ver: profiles, books, user_books, reviews, etc.

## 3. Variables de entorno (local)

1. En Supabase → **Settings → API**. Copia **Project URL** y **anon public key**.
2. En la raíz del proyecto, copia `.env.example` a `.env.local` y rellena:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. Reinicia `npm run dev`. Ya no estarás en "modo demo".

> Sin `.env.local`, la app corre igual en **modo demo** (mock data, login decorativo).
> En cuanto pones las llaves, el login y las queries reales se activan solos.

## 4. Activar el login

### Magic Link
Funciona en cuanto cargas las env vars. Supabase → **Authentication → Providers → Email**
debe estar habilitado (lo está por defecto).

### Google OAuth
1. Google Cloud Console → crea un proyecto → **APIs & Services → Credentials**.
2. **Create credentials → OAuth client ID → Web application**.
3. En **Authorized redirect URIs** añade la que te da Supabase:
   - Supabase → **Authentication → Providers → Google** muestra la *Callback URL*
     (algo como `https://TU-PROYECTO.supabase.co/auth/v1/callback`). Pégala ahí.
4. Copia el **Client ID** y **Client secret** de Google y pégalos en
   Supabase → **Authentication → Providers → Google** → habilita y guarda.

## 5. Deploy gratis en Vercel

1. Sube el repo a GitHub.
2. https://vercel.com → **Add New → Project** → importa el repo.
3. En **Environment Variables** añade las dos `NEXT_PUBLIC_SUPABASE_*` (mismas de local).
4. Deploy. Tendrás `https://tu-app.vercel.app`.
5. **Importante:** añade esa URL de Vercel a:
   - Supabase → **Authentication → URL Configuration → Site URL** y **Redirect URLs**
     (`https://tu-app.vercel.app/auth/callback`).
   - Google OAuth → redirect URIs (la callback de Supabase ya cubre prod).

## Arquitectura del código (referencia)

- `src/lib/supabase/env.ts` — detecta si Supabase está configurado (modo demo vs real).
- `src/lib/supabase/client.ts` — cliente para Client Components.
- `src/lib/supabase/server.ts` — cliente para Server Components/Actions/Route Handlers.
- `src/lib/supabase/proxy.ts` + `src/proxy.ts` — refresco de sesión (Next 16: "Proxy",
  antes "Middleware").
- `src/app/login/actions.ts` — Server Actions: Google, magic link, sign-out.
- `src/app/auth/callback/route.ts` — intercambia el code OAuth/magic-link por sesión.
