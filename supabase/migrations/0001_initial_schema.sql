-- =============================================================================
-- LibroApp — esquema inicial
-- Espejo de src/lib/types.ts. Pegar en Supabase → SQL Editor → Run.
-- Diseñado para Postgres (Supabase). Incluye RLS desde el inicio.
-- =============================================================================

-- Extensiones útiles
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- Enums de dominio
-- -----------------------------------------------------------------------------
create type shelf_status as enum ('want', 'reading', 'read', 'dnf', 'reread');
create type activity_type as enum ('finished', 'started', 'reviewed', 'rated');

-- -----------------------------------------------------------------------------
-- profiles — 1:1 con auth.users (lo crea Supabase Auth). Guarda lo "social".
--   Se llena automáticamente vía trigger al registrarse (ver más abajo).
-- -----------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text unique not null,
  name          text not null,
  bio           text,
  avatar_color  text not null default '#6f4e2e',
  avatar_url    text,
  theme_config  jsonb not null default '{}'::jsonb,   -- tema personalizado del usuario
  is_public     boolean not null default true,        -- perfil visible para la comunidad
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- books — catálogo. Una fila por libro, compartido entre usuarios.
--   En producción se "upsertea" desde Open Library al añadir un libro.
--   `external_id` evita duplicados (ej. OLID / ISBN de Open Library).
-- -----------------------------------------------------------------------------
create table public.books (
  id            uuid primary key default gen_random_uuid(),
  external_id   text unique,            -- id de Open Library (o null si manual)
  title         text not null,
  author        text not null,
  year          int,
  pages         int,
  cover_url     text,
  synopsis      text,
  genres        text[] not null default '{}',
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- user_books — la estantería: relación usuario↔libro con estado, rating, etc.
--   Espejo de UserBook. Único por (user, book).
-- -----------------------------------------------------------------------------
create table public.user_books (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  book_id       uuid not null references public.books (id) on delete cascade,
  status        shelf_status not null default 'want',
  rating        numeric(2,1) check (rating >= 0 and rating <= 5),
  current_page  int,
  started_at    date,
  finished_at   date,
  tags          text[] not null default '{}',
  updated_at    timestamptz not null default now(),
  unique (user_id, book_id)
);

-- -----------------------------------------------------------------------------
-- reviews — reseñas. Espejo de Review (likes/comments se cuentan, no se guardan
--   como número fijo). Una reseña por usuario y libro.
-- -----------------------------------------------------------------------------
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  book_id       uuid not null references public.books (id) on delete cascade,
  rating        numeric(2,1) not null check (rating >= 0 and rating <= 5),
  body          text not null,
  has_spoilers  boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (user_id, book_id)
);

create table public.review_likes (
  review_id     uuid not null references public.reviews (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (review_id, user_id)
);

create table public.review_comments (
  id            uuid primary key default gen_random_uuid(),
  review_id     uuid not null references public.reviews (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  body          text not null,
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- follows — grafo social (seguidor → seguido).
-- -----------------------------------------------------------------------------
create table public.follows (
  follower_id   uuid not null references public.profiles (id) on delete cascade,
  following_id  uuid not null references public.profiles (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- -----------------------------------------------------------------------------
-- activity — feed. Espejo de ActivityItem. Se inserta al reseñar/terminar/etc.
-- -----------------------------------------------------------------------------
create table public.activity (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  type          activity_type not null,
  book_id       uuid not null references public.books (id) on delete cascade,
  rating        numeric(2,1),
  snippet       text,
  created_at    timestamptz not null default now()
);

-- Índices para los listados más comunes
create index on public.user_books (user_id, status);
create index on public.reviews (book_id);
create index on public.activity (created_at desc);
create index on public.follows (following_id);

-- -----------------------------------------------------------------------------
-- Trigger: crear profile automáticamente al registrarse en auth.users.
--   Usa metadata de OAuth/email para name y un username inicial.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'user_name',
             split_part(new.email, '@', 1),
             'lector'),
    '[^a-z0-9_]', '', 'g'));
  if base_username = '' then base_username := 'lector'; end if;

  final_username := base_username;
  -- garantizar unicidad del username
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, name)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'name',
             final_username)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
