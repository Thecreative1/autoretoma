-- ============================================================
-- AutoRetoma — 00001: esquema base
-- ============================================================

-- Extensões necessárias
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
create type public.user_role as enum ('stand', 'admin');

create type public.stand_status as enum ('pendente', 'aprovado', 'suspenso', 'rejeitado');

create type public.listing_status as enum (
  'rascunho',
  'em_analise',
  'alteracoes_necessarias',
  'publicado',
  'reservado',
  'vendido',
  'rejeitado',
  'arquivado'
);

create type public.fuel_type as enum ('gasolina', 'gasoleo', 'gpl', 'hibrido', 'eletrico');

create type public.gearbox_type as enum ('manual', 'automatica');

create type public.condition_area as enum (
  'motor_mecanica',
  'embraiagem_caixa',
  'travoes',
  'pneus',
  'interior',
  'carrocaria_pintura',
  'eletronica',
  'documentacao',
  'outros'
);

create type public.condition_status as enum (
  'sem_problema',
  'desgaste_normal',
  'precisa_atencao',
  'problema_declarado',
  'nao_verificado'
);

create type public.issue_severity as enum ('baixa', 'media', 'alta');

create type public.lead_status as enum ('novo', 'contactado', 'fechado');

create type public.photo_category as enum (
  'frontal',
  'traseira',
  'lateral_esquerda',
  'lateral_direita',
  'interior',
  'conta_quilometros',
  'motor',
  'defeito',
  'outra'
);

-- ------------------------------------------------------------
-- Perfis (ligados a auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'stand',
  created_at timestamptz not null default now()
);

-- Função auxiliar: o utilizador atual é administrador?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Cria o perfil automaticamente no registo
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'stand')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Stands (vendedores profissionais)
-- ------------------------------------------------------------
create table public.stands (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  slug text not null unique,
  commercial_name text not null,
  company_name text not null,
  nif text not null unique check (nif ~ '^[0-9]{9}$'),
  contact_name text not null,
  email text not null,
  phone text not null,
  whatsapp text,
  address text not null,
  district text not null,
  website text,
  logo_url text,
  activity_id text,
  status public.stand_status not null default 'pendente',
  admin_notes text,
  is_demo boolean not null default false,
  terms_accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger stands_updated_at
  before update on public.stands
  for each row execute function public.set_updated_at();

-- Um stand não pode alterar o próprio estado nem as notas administrativas
create or replace function public.guard_stand_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() nulo = contexto de servidor (service role/migrações);
  -- pedidos anónimos nunca passam o RLS de escrita.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if new.status is distinct from old.status
     or new.admin_notes is distinct from old.admin_notes
     or new.is_demo is distinct from old.is_demo
     or new.owner_id is distinct from old.owner_id then
    raise exception 'Sem permissão para alterar o estado do stand.';
  end if;
  return new;
end;
$$;

create trigger stands_guard_update
  before update on public.stands
  for each row execute function public.guard_stand_update();

-- Função auxiliar: id do stand do utilizador atual
create or replace function public.current_stand_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.stands where owner_id = auth.uid();
$$;

-- ------------------------------------------------------------
-- Marcas e modelos
-- ------------------------------------------------------------
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (brand_id, slug)
);

-- ------------------------------------------------------------
-- Definições da plataforma (linha única)
-- ------------------------------------------------------------
create table public.platform_settings (
  id integer primary key default 1 check (id = 1),
  max_price_eur integer not null default 5000 check (max_price_eur > 0),
  min_photos integer not null default 8 check (min_photos >= 1),
  facet_min_listings integer not null default 3 check (facet_min_listings >= 1),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

insert into public.platform_settings (id) values (1);

-- ------------------------------------------------------------
-- Anúncios
-- ------------------------------------------------------------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  stand_id uuid not null references public.stands (id) on delete cascade,
  brand_id uuid not null references public.brands (id),
  model_id uuid not null references public.models (id),
  version text,
  year integer not null check (year between 1950 and extract(year from now())::int + 1),
  month integer check (month between 1 and 12),
  -- price e district ficam nulos enquanto o anúncio é rascunho;
  -- passam a obrigatórios na submissão para aprovação (ver trigger).
  price integer check (price > 0),
  mileage integer not null check (mileage >= 0),
  fuel public.fuel_type not null,
  displacement_cc integer check (displacement_cc between 1 and 10000),
  power_hp integer check (power_hp between 1 and 2000),
  gearbox public.gearbox_type not null,
  doors integer check (doors between 2 and 6),
  district text,
  municipality text,
  inspection_valid_until date,
  keys_count integer check (keys_count between 0 and 9),
  maintenance_history text,
  owners_count integer check (owners_count between 1 and 99),
  description text,
  status public.listing_status not null default 'rascunho',
  slug text unique,
  featured boolean not null default false,
  views_count integer not null default 0,
  admin_feedback text,
  submitted_at timestamptz,
  published_at timestamptz,
  sold_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_status_idx on public.listings (status);
create index listings_stand_idx on public.listings (stand_id);
create index listings_brand_idx on public.listings (brand_id);
create index listings_search_idx on public.listings (status, price, year, mileage);
create index listings_published_at_idx on public.listings (published_at desc);

create trigger listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Estados públicos (visíveis a qualquer visitante)
create or replace function public.is_public_listing_status(s public.listing_status)
returns boolean
language sql
immutable
as $$
  select s in ('publicado', 'reservado', 'vendido');
$$;

-- Transições de estado permitidas
--   Stand:  rascunho -> em_analise | arquivado
--           alteracoes_necessarias -> em_analise | arquivado
--           em_analise -> rascunho (retirar da fila)
--           publicado <-> reservado; publicado|reservado -> vendido | arquivado
--           vendido -> arquivado
--   Admin:  qualquer transição
create or replace function public.guard_listing_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_price integer;
  v_stand_status public.stand_status;
begin
  if auth.uid() is null or public.is_admin() then
    if new.status = 'publicado' and old.status is distinct from 'publicado' and new.published_at is null then
      new.published_at := now();
    end if;
    if new.status = 'vendido' and old.status is distinct from 'vendido' and new.sold_at is null then
      new.sold_at := now();
    end if;
    return new;
  end if;

  -- Campos reservados ao administrador
  if new.featured is distinct from old.featured
     or new.admin_feedback is distinct from old.admin_feedback
     or new.stand_id is distinct from old.stand_id
     or new.views_count is distinct from old.views_count then
    raise exception 'Campo reservado à administração.';
  end if;

  if new.status is distinct from old.status then
    if not (
      (old.status = 'rascunho' and new.status in ('em_analise', 'arquivado'))
      or (old.status = 'alteracoes_necessarias' and new.status in ('em_analise', 'arquivado'))
      or (old.status = 'em_analise' and new.status = 'rascunho')
      or (old.status = 'publicado' and new.status in ('reservado', 'vendido', 'arquivado'))
      or (old.status = 'reservado' and new.status in ('publicado', 'vendido', 'arquivado'))
      or (old.status = 'vendido' and new.status = 'arquivado')
    ) then
      raise exception 'Transição de estado não permitida (% -> %).', old.status, new.status;
    end if;

    if new.status = 'em_analise' then
      select status into v_stand_status from public.stands where id = new.stand_id;
      if v_stand_status is distinct from 'aprovado' then
        raise exception 'O stand ainda não está aprovado.';
      end if;
      if new.price is null or new.district is null then
        raise exception 'Indique o preço e a localização antes de submeter.';
      end if;
      select max_price_eur into v_max_price from public.platform_settings where id = 1;
      if new.price > v_max_price then
        raise exception 'O preço excede o limite atual da plataforma (% €).', v_max_price;
      end if;
      new.submitted_at := now();
    end if;

    if new.status = 'vendido' then
      new.sold_at := now();
    end if;
  end if;

  -- Depois de publicado, o stand não edita os dados de fundo (apenas estados)
  if old.status in ('publicado', 'reservado', 'vendido', 'em_analise')
     and new.status = old.status
     and (
       new.price is distinct from old.price
       or new.mileage is distinct from old.mileage
       or new.brand_id is distinct from old.brand_id
       or new.model_id is distinct from old.model_id
       or new.year is distinct from old.year
       or new.description is distinct from old.description
     ) then
    raise exception 'O anúncio está em análise ou publicado; para alterações contacte a administração ou arquive o anúncio.';
  end if;

  return new;
end;
$$;

create trigger listings_guard_transition
  before update on public.listings
  for each row execute function public.guard_listing_transition();

-- Um stand só cria anúncios em rascunho e no próprio stand
create or replace function public.guard_listing_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if new.stand_id is distinct from public.current_stand_id() then
    raise exception 'Só pode criar anúncios no seu próprio stand.';
  end if;
  if new.status is distinct from 'rascunho' then
    raise exception 'Novos anúncios começam sempre em rascunho.';
  end if;
  if new.featured or new.views_count <> 0 then
    raise exception 'Campo reservado à administração.';
  end if;
  return new;
end;
$$;

create trigger listings_guard_insert
  before insert on public.listings
  for each row execute function public.guard_listing_insert();

-- ------------------------------------------------------------
-- Estado da viatura por área
-- ------------------------------------------------------------
create table public.listing_conditions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  area public.condition_area not null,
  status public.condition_status not null default 'nao_verificado',
  unique (listing_id, area)
);

create index listing_conditions_listing_idx on public.listing_conditions (listing_id);

-- ------------------------------------------------------------
-- Problemas declarados
-- ------------------------------------------------------------
create table public.listing_issues (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  area public.condition_area not null,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 3 and 2000),
  severity public.issue_severity not null default 'media',
  photo_url text,
  repair_estimate_eur integer check (repair_estimate_eur >= 0),
  prevents_driving boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index listing_issues_listing_idx on public.listing_issues (listing_id);

-- ------------------------------------------------------------
-- Fotografias
-- ------------------------------------------------------------
create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  url text not null,
  category public.photo_category not null default 'outra',
  is_defect boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index listing_photos_listing_idx on public.listing_photos (listing_id, sort_order);

-- Escrita nos dados filhos apenas com o anúncio em edição (ou admin)
create or replace function public.guard_listing_child_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing_id uuid;
  v_status public.listing_status;
begin
  -- OLD/NEW só existem consoante a operação: usar TG_OP para os distinguir.
  if tg_op = 'DELETE' then
    v_listing_id := old.listing_id;
  else
    v_listing_id := new.listing_id;
  end if;

  if auth.uid() is not null and not public.is_admin() then
    select status into v_status from public.listings where id = v_listing_id;
    if v_status is null or v_status not in ('rascunho', 'alteracoes_necessarias') then
      raise exception 'O anúncio já não está em edição.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger listing_conditions_guard
  before insert or update or delete on public.listing_conditions
  for each row execute function public.guard_listing_child_write();

create trigger listing_issues_guard
  before insert or update or delete on public.listing_issues
  for each row execute function public.guard_listing_child_write();

create trigger listing_photos_guard
  before insert or update or delete on public.listing_photos
  for each row execute function public.guard_listing_child_write();

-- ------------------------------------------------------------
-- Leads (pedidos de contacto)
-- ------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  stand_id uuid not null references public.stands (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  email text not null,
  phone text,
  message text not null check (char_length(message) between 5 and 2000),
  rgpd_consent boolean not null check (rgpd_consent = true),
  status public.lead_status not null default 'novo',
  ip_hash text,
  created_at timestamptz not null default now()
);

create index leads_stand_idx on public.leads (stand_id, created_at desc);
create index leads_listing_idx on public.leads (listing_id);
create index leads_ip_idx on public.leads (ip_hash, created_at desc);

-- ------------------------------------------------------------
-- Registo de ações administrativas
-- ------------------------------------------------------------
create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users (id),
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Contador de visualizações (chamado pelo servidor na página do anúncio)
-- ------------------------------------------------------------
create or replace function public.increment_listing_views(p_listing_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.listings
  set views_count = views_count + 1
  where id = p_listing_id
    and public.is_public_listing_status(status);
$$;

revoke all on function public.increment_listing_views(uuid) from public;
grant execute on function public.increment_listing_views(uuid) to anon, authenticated, service_role;
