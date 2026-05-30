-- =============================================================================
-- LibroApp — Row Level Security (RLS)
-- Reglas de acceso por fila. Pegar DESPUÉS de 0001 en el SQL Editor.
--
-- Modelo:
--   - profiles públicos: cualquiera (incluso sin login) los ve si is_public.
--   - cada usuario solo escribe SUS datos.
--   - estantería/reseñas de un usuario son visibles si su perfil es público.
--   - books: lectura pública; escritura solo de usuarios autenticados (upsert
--     desde Open Library).
-- =============================================================================

alter table public.profiles        enable row level security;
alter table public.books           enable row level security;
alter table public.user_books      enable row level security;
alter table public.reviews         enable row level security;
alter table public.review_likes    enable row level security;
alter table public.review_comments enable row level security;
alter table public.follows         enable row level security;
alter table public.activity        enable row level security;

-- Helper: ¿el perfil dueño de esta fila es público?
create or replace function public.is_profile_public(p uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_public from public.profiles where id = p), false);
$$;

-- ---------------------------------------------------------------- profiles ---
create policy "perfiles públicos visibles para todos"
  on public.profiles for select
  using (is_public or id = auth.uid());

create policy "el usuario edita su propio perfil"
  on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- (el INSERT lo hace el trigger handle_new_user con security definer)

-- ------------------------------------------------------------------- books ---
create policy "catálogo de libros legible por todos"
  on public.books for select using (true);

create policy "usuarios autenticados pueden añadir libros"
  on public.books for insert to authenticated with check (true);

create policy "usuarios autenticados pueden completar datos de libros"
  on public.books for update to authenticated using (true) with check (true);

-- -------------------------------------------------------------- user_books ---
create policy "estantería visible si el perfil es público o es propia"
  on public.user_books for select
  using (user_id = auth.uid() or public.is_profile_public(user_id));

create policy "el usuario gestiona su propia estantería"
  on public.user_books for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------- reviews ---
create policy "reseñas visibles si el perfil es público o son propias"
  on public.reviews for select
  using (user_id = auth.uid() or public.is_profile_public(user_id));

create policy "el usuario gestiona sus propias reseñas"
  on public.reviews for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------------------------------------------------------ review_likes ---
create policy "likes visibles para todos"
  on public.review_likes for select using (true);

create policy "el usuario da/quita sus propios likes"
  on public.review_likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --------------------------------------------------------- review_comments ---
create policy "comentarios visibles para todos"
  on public.review_comments for select using (true);

create policy "el usuario gestiona sus propios comentarios"
  on public.review_comments for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------- follows ---
create policy "relaciones de seguimiento visibles para todos"
  on public.follows for select using (true);

create policy "el usuario gestiona a quién sigue"
  on public.follows for all
  using (follower_id = auth.uid()) with check (follower_id = auth.uid());

-- ---------------------------------------------------------------- activity ---
create policy "actividad visible si el perfil es público o es propia"
  on public.activity for select
  using (user_id = auth.uid() or public.is_profile_public(user_id));

create policy "el usuario inserta su propia actividad"
  on public.activity for insert
  with check (user_id = auth.uid());
