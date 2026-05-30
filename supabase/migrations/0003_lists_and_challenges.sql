-- =============================================================================
-- LibroApp — listas curadas + retos de lectura
-- Pegar DESPUÉS de 0001 y 0002 en el SQL Editor de Supabase.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- lists — colecciones curadas por el usuario (públicas o privadas).
-- list_books — libros dentro de una lista (ordenados por position).
-- -----------------------------------------------------------------------------
create table public.lists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  name        text not null,
  description text,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.list_books (
  list_id    uuid not null references public.lists (id) on delete cascade,
  book_id    uuid not null references public.books (id) on delete cascade,
  position   int not null default 0,
  added_at   timestamptz not null default now(),
  primary key (list_id, book_id)
);

create index on public.lists (user_id);
create index on public.list_books (list_id, position);

-- -----------------------------------------------------------------------------
-- challenges — meta anual de lectura por usuario (un reto por año).
--   El progreso (libros leídos en el año) se calcula en la app desde user_books,
--   no se almacena, para que siempre esté al día.
-- -----------------------------------------------------------------------------
create table public.challenges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  year        int not null,
  goal        int not null check (goal > 0),
  created_at  timestamptz not null default now(),
  unique (user_id, year)
);

create index on public.challenges (user_id, year);

-- ---------------------------------------------------------------------- RLS ---
alter table public.lists       enable row level security;
alter table public.list_books  enable row level security;
alter table public.challenges  enable row level security;

-- lists: visibles si son públicas o propias; el dueño las gestiona.
create policy "listas visibles si públicas o propias"
  on public.lists for select
  using (is_public or user_id = auth.uid());

create policy "el usuario gestiona sus propias listas"
  on public.lists for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- list_books: visibles si la lista padre es visible; gestionables por el dueño.
create policy "items de lista visibles si la lista es visible"
  on public.list_books for select
  using (
    exists (
      select 1 from public.lists l
      where l.id = list_id and (l.is_public or l.user_id = auth.uid())
    )
  );

create policy "el dueño de la lista gestiona sus items"
  on public.list_books for all
  using (
    exists (select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid())
  );

-- challenges: visibles si el perfil dueño es público o es propio; gestiona el dueño.
create policy "retos visibles si el perfil es público o es propio"
  on public.challenges for select
  using (user_id = auth.uid() or public.is_profile_public(user_id));

create policy "el usuario gestiona sus propios retos"
  on public.challenges for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
