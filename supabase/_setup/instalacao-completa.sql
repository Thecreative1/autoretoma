-- ============================================================
-- AutoRetoma — instalação completa (esquema + RLS + storage + demo)
-- Colar TUDO no SQL Editor do Supabase e executar de uma vez.
-- ============================================================


-- >>>>>>>>>>>>>>> supabase/migrations/00001_schema.sql <<<<<<<<<<<<<<<

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

-- >>>>>>>>>>>>>>> supabase/migrations/00002_rls.sql <<<<<<<<<<<<<<<

-- ============================================================
-- AutoRetoma — 00002: Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.stands enable row level security;
alter table public.brands enable row level security;
alter table public.models enable row level security;
alter table public.platform_settings enable row level security;
alter table public.listings enable row level security;
alter table public.listing_conditions enable row level security;
alter table public.listing_issues enable row level security;
alter table public.listing_photos enable row level security;
alter table public.leads enable row level security;
alter table public.admin_audit_log enable row level security;

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create policy "profiles: ler o próprio perfil"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- Sem políticas de escrita: o perfil é criado por trigger e o papel
-- só muda por SQL/service role.

-- ------------------------------------------------------------
-- stands
-- ------------------------------------------------------------
create policy "stands: público vê stands aprovados"
  on public.stands for select
  using (status = 'aprovado' or owner_id = auth.uid() or public.is_admin());

create policy "stands: registo do próprio stand"
  on public.stands for insert
  with check (
    owner_id = auth.uid()
    and status = 'pendente'
    and is_demo = false
  );

create policy "stands: atualizar o próprio stand"
  on public.stands for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
-- (as colunas sensíveis são protegidas pelo trigger stands_guard_update)

-- ------------------------------------------------------------
-- brands / models — leitura pública, escrita administrativa
-- ------------------------------------------------------------
create policy "brands: leitura pública" on public.brands for select using (true);
create policy "brands: escrita admin" on public.brands for all
  using (public.is_admin()) with check (public.is_admin());

create policy "models: leitura pública" on public.models for select using (true);
create policy "models: escrita admin" on public.models for all
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- platform_settings — leitura pública (limite de preço nos filtros),
-- escrita administrativa
-- ------------------------------------------------------------
create policy "settings: leitura pública" on public.platform_settings for select using (true);
create policy "settings: escrita admin" on public.platform_settings for update
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- listings
-- ------------------------------------------------------------
create policy "listings: público vê anúncios publicados de stands aprovados"
  on public.listings for select
  using (
    (
      public.is_public_listing_status(status)
      and exists (
        select 1 from public.stands s
        where s.id = stand_id and s.status = 'aprovado'
      )
    )
    or stand_id = public.current_stand_id()
    or public.is_admin()
  );

create policy "listings: stand cria os próprios anúncios"
  on public.listings for insert
  with check (stand_id = public.current_stand_id() or public.is_admin());

create policy "listings: stand atualiza os próprios anúncios"
  on public.listings for update
  using (stand_id = public.current_stand_id() or public.is_admin())
  with check (stand_id = public.current_stand_id() or public.is_admin());
-- (transições e campos reservados validados pelo trigger)

create policy "listings: apagar apenas rascunhos próprios"
  on public.listings for delete
  using (
    public.is_admin()
    or (stand_id = public.current_stand_id() and status = 'rascunho')
  );

-- ------------------------------------------------------------
-- Dados filhos do anúncio: visíveis quando o anúncio é visível;
-- escrita pelo dono (trigger limita ao estado de edição)
-- ------------------------------------------------------------
create or replace function public.can_view_listing(p_listing_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listings l
    join public.stands s on s.id = l.stand_id
    where l.id = p_listing_id
      and (
        (public.is_public_listing_status(l.status) and s.status = 'aprovado')
        or l.stand_id = public.current_stand_id()
        or public.is_admin()
      )
  );
$$;

create or replace function public.owns_listing(p_listing_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.listings l
    where l.id = p_listing_id
      and (l.stand_id = public.current_stand_id() or public.is_admin())
  );
$$;

create policy "conditions: leitura" on public.listing_conditions for select
  using (public.can_view_listing(listing_id));
create policy "conditions: escrita do dono" on public.listing_conditions for all
  using (public.owns_listing(listing_id)) with check (public.owns_listing(listing_id));

create policy "issues: leitura" on public.listing_issues for select
  using (public.can_view_listing(listing_id));
create policy "issues: escrita do dono" on public.listing_issues for all
  using (public.owns_listing(listing_id)) with check (public.owns_listing(listing_id));

create policy "photos: leitura" on public.listing_photos for select
  using (public.can_view_listing(listing_id));
create policy "photos: escrita do dono" on public.listing_photos for all
  using (public.owns_listing(listing_id)) with check (public.owns_listing(listing_id));

-- ------------------------------------------------------------
-- leads — inseridos apenas pelo servidor (service role, que ignora RLS).
-- O stand lê e gere os leads dos seus anúncios; o admin vê tudo.
-- ------------------------------------------------------------
create policy "leads: stand lê os próprios leads"
  on public.leads for select
  using (stand_id = public.current_stand_id() or public.is_admin());

create policy "leads: stand atualiza o estado dos próprios leads"
  on public.leads for update
  using (stand_id = public.current_stand_id() or public.is_admin())
  with check (stand_id = public.current_stand_id() or public.is_admin());

-- ------------------------------------------------------------
-- admin_audit_log — apenas administradores leem; escrita via service role
-- ------------------------------------------------------------
create policy "audit: leitura admin"
  on public.admin_audit_log for select
  using (public.is_admin());

-- ------------------------------------------------------------
-- Privilégios ao nível do SQL.
-- O Supabase já os concede por omissão; declará-los aqui torna o esquema
-- reprodutível em instalações próprias. O controlo de acesso efetivo é
-- feito pelas políticas RLS acima — sem política aplicável, nada passa.
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select on
  public.brands, public.models, public.platform_settings,
  public.stands, public.listings, public.listing_conditions,
  public.listing_issues, public.listing_photos
to anon, authenticated;

grant select on public.profiles, public.leads, public.admin_audit_log to authenticated;

grant insert, update, delete on
  public.stands, public.listings, public.listing_conditions,
  public.listing_issues, public.listing_photos
to authenticated;

grant update on public.leads, public.platform_settings to authenticated;
grant insert, update, delete on public.brands, public.models to authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated;

-- >>>>>>>>>>>>>>> supabase/migrations/00003_storage.sql <<<<<<<<<<<<<<<

-- ============================================================
-- AutoRetoma — 00003: Storage (fotografias e logótipos)
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('listings', 'listings', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('logos', 'logos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

-- Leitura pública (os buckets são públicos, mas a política é necessária
-- para o endpoint de listagem/objetos)
create policy "storage: leitura pública de imagens"
  on storage.objects for select
  using (bucket_id in ('listings', 'logos'));

-- Cada utilizador autenticado escreve apenas na sua pasta:
-- listings/{auth.uid()}/... e logos/{auth.uid()}/...
create policy "storage: upload na própria pasta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('listings', 'logos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage: atualizar na própria pasta"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('listings', 'logos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage: apagar na própria pasta"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('listings', 'logos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- >>>>>>>>>>>>>>> supabase/seed.sql <<<<<<<<<<<<<<<

-- ============================================================
-- AutoRetoma — dados de demonstração
-- Todos os stands, viaturas e pessoas são FICTÍCIOS.
-- Palavra-passe de todas as contas demo: demo12345
-- ============================================================

set search_path = public, extensions;

-- ------------------------------------------------------------
-- 1) Utilizadores demo (auth)
-- ------------------------------------------------------------
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-a000-000000000001', 'authenticated', 'authenticated',
   'admin@autoretoma.demo', crypt('demo12345', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-a000-000000000002', 'authenticated', 'authenticated',
   'stand.norte@autoretoma.demo', crypt('demo12345', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-a000-000000000003', 'authenticated', 'authenticated',
   'stand.lisboa@autoretoma.demo', crypt('demo12345', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-a000-000000000004', 'authenticated', 'authenticated',
   'stand.algarve@autoretoma.demo', crypt('demo12345', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

insert into auth.identities
  (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users u
where u.email like '%@autoretoma.demo';

-- Papel de administrador
update public.profiles set role = 'admin'
where id = '00000000-0000-4000-a000-000000000001';

-- ------------------------------------------------------------
-- 2) Stands fictícios (aprovados, marcados como demonstração)
-- ------------------------------------------------------------
insert into public.stands
  (id, owner_id, slug, commercial_name, company_name, nif, contact_name, email, phone,
   whatsapp, address, district, website, logo_url, status, is_demo, terms_accepted_at)
values
  ('10000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000002',
   'stand-demo-norte', 'Stand Demo Norte', 'Demo Norte Automóveis, Lda. (fictício)', '500000001',
   'Carlos Exemplo', 'stand.norte@autoretoma.demo', '253000001', '910000001',
   'Rua Fictícia do Comércio, 12', 'Braga', null, '/demo/logo-stand.svg', 'aprovado', true, now()),
  ('10000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000003',
   'auto-demo-lisboa', 'Auto Demo Lisboa', 'Demo Capital Motors, Unipessoal (fictício)', '500000002',
   'Marta Exemplo', 'stand.lisboa@autoretoma.demo', '210000002', '920000002',
   'Avenida Imaginária, 250', 'Lisboa', null, '/demo/logo-stand.svg', 'aprovado', true, now()),
  ('10000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000004',
   'algarve-retomas-demo', 'Algarve Retomas Demo', 'Demo Sul Veículos, Lda. (fictício)', '500000003',
   'Rui Exemplo', 'stand.algarve@autoretoma.demo', '289000003', '930000003',
   'Estrada Exemplo, km 3', 'Faro', null, '/demo/logo-stand.svg', 'aprovado', true, now());

-- ------------------------------------------------------------
-- 3) Marcas e modelos
-- ------------------------------------------------------------
insert into public.brands (name, slug) values
  ('Opel', 'opel'), ('Renault', 'renault'), ('Peugeot', 'peugeot'), ('Volkswagen', 'volkswagen'),
  ('Ford', 'ford'), ('Fiat', 'fiat'), ('Citroën', 'citroen'), ('Seat', 'seat'),
  ('Toyota', 'toyota'), ('Mercedes-Benz', 'mercedes-benz'), ('BMW', 'bmw'), ('Audi', 'audi'),
  ('Nissan', 'nissan'), ('Honda', 'honda'), ('Hyundai', 'hyundai'), ('Kia', 'kia'),
  ('Skoda', 'skoda'), ('Volvo', 'volvo'), ('Dacia', 'dacia'), ('Mazda', 'mazda'),
  ('Mitsubishi', 'mitsubishi'), ('Suzuki', 'suzuki'), ('Alfa Romeo', 'alfa-romeo'), ('Smart', 'smart');

insert into public.models (brand_id, name, slug)
select b.id, m.name, m.slug
from (values
  ('opel', 'Corsa', 'corsa'), ('opel', 'Astra', 'astra'), ('opel', 'Agila', 'agila'),
  ('renault', 'Clio', 'clio'), ('renault', 'Mégane', 'megane'), ('renault', 'Twingo', 'twingo'),
  ('peugeot', '206', '206'), ('peugeot', '207', '207'), ('peugeot', '307', '307'),
  ('volkswagen', 'Golf', 'golf'), ('volkswagen', 'Polo', 'polo'), ('volkswagen', 'Passat', 'passat'),
  ('ford', 'Fiesta', 'fiesta'), ('ford', 'Focus', 'focus'), ('ford', 'Ka', 'ka'),
  ('fiat', 'Punto', 'punto'), ('fiat', 'Panda', 'panda'), ('fiat', '500', '500'),
  ('citroen', 'C3', 'c3'), ('citroen', 'Saxo', 'saxo'), ('citroen', 'Xsara', 'xsara'),
  ('seat', 'Ibiza', 'ibiza'), ('seat', 'Leon', 'leon'),
  ('toyota', 'Yaris', 'yaris'), ('toyota', 'Corolla', 'corolla'),
  ('mercedes-benz', 'Classe A', 'classe-a'), ('mercedes-benz', 'Classe C', 'classe-c'),
  ('bmw', 'Série 3', 'serie-3'), ('audi', 'A3', 'a3'), ('audi', 'A4', 'a4'),
  ('nissan', 'Micra', 'micra'), ('honda', 'Civic', 'civic'), ('hyundai', 'Getz', 'getz'),
  ('kia', 'Picanto', 'picanto'), ('skoda', 'Fabia', 'fabia'), ('volvo', 'V40', 'v40'),
  ('dacia', 'Sandero', 'sandero'), ('mazda', '2', '2'), ('mitsubishi', 'Colt', 'colt'),
  ('suzuki', 'Swift', 'swift'), ('alfa-romeo', '147', '147'), ('smart', 'ForTwo', 'fortwo')
) as m(brand_slug, name, slug)
join public.brands b on b.slug = m.brand_slug;

-- ------------------------------------------------------------
-- 4) Função temporária para semear anúncios completos
-- ------------------------------------------------------------
create or replace function pg_temp.seed_listing(p jsonb)
returns uuid
language plpgsql
as $fn$
declare
  v_id uuid := gen_random_uuid();
  v_stand uuid;
  v_brand uuid;
  v_model uuid;
  v_areas public.condition_area[] := enum_range(null::public.condition_area);
  v_area public.condition_area;
  v_issue jsonb;
  v_sort int := 0;
  v_cat text;
begin
  select id into v_stand from public.stands where slug = p->>'stand';
  select id into v_brand from public.brands where slug = p->>'brand';
  select id into v_model from public.models where brand_id = v_brand and slug = p->>'model';

  insert into public.listings
    (id, stand_id, brand_id, model_id, version, year, month, price, mileage, fuel,
     displacement_cc, power_hp, gearbox, doors, district, municipality,
     inspection_valid_until, keys_count, maintenance_history, owners_count, description,
     status, slug, views_count, published_at, sold_at)
  values
    (v_id, v_stand, v_brand, v_model, p->>'version', (p->>'year')::int, (p->>'month')::int,
     (p->>'price')::int, (p->>'mileage')::int, (p->>'fuel')::public.fuel_type,
     (p->>'cc')::int, (p->>'hp')::int, (p->>'gearbox')::public.gearbox_type, (p->>'doors')::int,
     p->>'district', p->>'municipality',
     (p->>'inspection')::date, (p->>'keys')::int, p->>'maintenance', (p->>'owners')::int,
     p->>'description', (p->>'status')::public.listing_status, p->>'slug',
     coalesce((p->>'views')::int, 0),
     now() - (coalesce((p->>'days_ago')::int, 0) || ' days')::interval,
     case when p->>'status' = 'vendido' then now() - interval '2 days' else null end);

  -- Estado por área (por omissão: sem problema conhecido)
  foreach v_area in array v_areas
  loop
    insert into public.listing_conditions (listing_id, area, status)
    values (v_id, v_area,
      coalesce((p->'conditions'->>v_area::text)::public.condition_status, 'sem_problema'));
  end loop;

  -- Fotografias standard (imagens de demonstração)
  foreach v_cat in array array['frontal','traseira','lateral_esquerda','lateral_direita',
                               'interior','conta_quilometros','motor','outra']
  loop
    insert into public.listing_photos (listing_id, url, category, is_defect, sort_order)
    values (v_id,
      '/demo/' || replace(case when v_cat = 'outra' then 'geral' else v_cat end, '_', '-') || '.svg',
      v_cat::public.photo_category, false, v_sort);
    v_sort := v_sort + 1;
  end loop;

  -- Problemas declarados + fotografia de defeito
  for v_issue in select * from jsonb_array_elements(coalesce(p->'issues', '[]'::jsonb))
  loop
    insert into public.listing_issues
      (listing_id, area, title, description, severity, photo_url,
       repair_estimate_eur, prevents_driving, sort_order)
    values
      (v_id, (v_issue->>'area')::public.condition_area, v_issue->>'title',
       v_issue->>'description', (v_issue->>'severity')::public.issue_severity,
       '/demo/defeito.svg', (v_issue->>'repair')::int,
       coalesce((v_issue->>'prevents_driving')::boolean, false), v_sort);

    insert into public.listing_photos (listing_id, url, category, is_defect, sort_order)
    values (v_id, '/demo/defeito.svg', 'defeito', true, v_sort);
    v_sort := v_sort + 1;
  end loop;

  return v_id;
end;
$fn$;

-- ------------------------------------------------------------
-- 5) Dez viaturas fictícias
-- ------------------------------------------------------------
select pg_temp.seed_listing($json$
{
  "stand": "stand-demo-norte", "brand": "opel", "model": "corsa",
  "version": "1.2 Twinport Enjoy", "year": 2004, "month": 6, "price": 2450, "mileage": 189000,
  "fuel": "gasolina", "cc": 1229, "hp": 80, "gearbox": "manual", "doors": 5,
  "district": "Braga", "municipality": "Guimarães", "inspection": "2026-11-15",
  "keys": 2, "owners": 3, "maintenance": "Última revisão com mudança de óleo e filtros aos 185.000 km. Sem histórico completo de manutenção.",
  "description": "Retoma em bom estado geral para a idade. Pintura com riscos de uso e um amolgadela pequena na porta traseira direita, declarada abaixo. Mecânica sem problemas conhecidos.",
  "status": "publicado", "slug": "opel-corsa-2004-guimaraes-2450", "views": 214, "days_ago": 3,
  "conditions": { "carrocaria_pintura": "problema_declarado", "pneus": "desgaste_normal", "interior": "desgaste_normal", "documentacao": "sem_problema" },
  "issues": [
    { "area": "carrocaria_pintura", "title": "Amolgadela na porta traseira direita", "description": "Amolgadela com cerca de 10 cm sem ferrugem, apenas estética. A pintura tem riscos normais de utilização.", "severity": "baixa", "repair": 150, "prevents_driving": false }
  ]
}
$json$::jsonb);

select pg_temp.seed_listing($json$
{
  "stand": "stand-demo-norte", "brand": "renault", "model": "clio",
  "version": "1.5 dCi Confort", "year": 2007, "month": 2, "price": 3200, "mileage": 224000,
  "fuel": "gasoleo", "cc": 1461, "hp": 85, "gearbox": "manual", "doors": 5,
  "district": "Braga", "municipality": "Braga", "inspection": "2027-01-20",
  "keys": 1, "owners": 2, "maintenance": "Manutenção regular em oficina independente. Correia de distribuição substituída aos 190.000 km (com fatura).",
  "description": "Clio dCi económico, ideal para quem faz muitos quilómetros. A embraiagem começa a dar sinais de desgaste e está declarada abaixo com estimativa de reparação.",
  "status": "publicado", "slug": "renault-clio-2007-braga-3200", "views": 342, "days_ago": 5,
  "conditions": { "embraiagem_caixa": "problema_declarado", "pneus": "precisa_atencao", "interior": "desgaste_normal" },
  "issues": [
    { "area": "embraiagem_caixa", "title": "Embraiagem com desgaste avançado", "description": "A embraiagem patina ligeiramente em subidas com carga. Continua a circular normalmente, mas recomenda-se substituição nos próximos meses.", "severity": "media", "repair": 450, "prevents_driving": false },
    { "area": "pneus", "title": "Pneus dianteiros no limite", "description": "Os dois pneus dianteiros estão perto do limite legal e devem ser substituídos em breve.", "severity": "baixa", "repair": 120, "prevents_driving": false }
  ]
}
$json$::jsonb);

select pg_temp.seed_listing($json$
{
  "stand": "stand-demo-norte", "brand": "peugeot", "model": "206",
  "version": "1.4 HDi XT", "year": 2005, "month": 9, "price": 2900, "mileage": 201000,
  "fuel": "gasoleo", "cc": 1398, "hp": 68, "gearbox": "manual", "doors": 3,
  "district": "Porto", "municipality": "Porto", "inspection": "2026-09-30",
  "keys": 2, "owners": 2, "maintenance": "Revisões feitas de forma regular; últimas faturas disponíveis para consulta no stand.",
  "description": "206 HDi de utilização citadina, motor muito económico. Sem problemas mecânicos conhecidos; apenas desgaste normal de interior.",
  "status": "publicado", "slug": "peugeot-206-2005-porto-2900", "views": 187, "days_ago": 7,
  "conditions": { "interior": "desgaste_normal", "carrocaria_pintura": "desgaste_normal", "eletronica": "nao_verificado" }
}
$json$::jsonb);

select pg_temp.seed_listing($json$
{
  "stand": "stand-demo-norte", "brand": "volkswagen", "model": "golf",
  "version": "IV 1.9 TDI 100cv", "year": 2002, "month": 4, "price": 3500, "mileage": 268000,
  "fuel": "gasoleo", "cc": 1896, "hp": 100, "gearbox": "manual", "doors": 5,
  "district": "Porto", "municipality": "Vila Nova de Gaia", "inspection": "2026-10-05",
  "keys": 1, "owners": 4, "maintenance": "Histórico parcial. Embraiagem e volante bimassa substituídos aos 240.000 km.",
  "description": "Golf IV TDI clássico e fiável. Tem focos de ferrugem nos guarda-lamas e o ar condicionado não funciona — ambos declarados abaixo com estimativas.",
  "status": "publicado", "slug": "volkswagen-golf-2002-vila-nova-de-gaia-3500", "views": 421, "days_ago": 10,
  "conditions": { "carrocaria_pintura": "problema_declarado", "eletronica": "problema_declarado", "motor_mecanica": "sem_problema", "interior": "desgaste_normal" },
  "issues": [
    { "area": "carrocaria_pintura", "title": "Ferrugem nos guarda-lamas traseiros", "description": "Focos de ferrugem superficial nos dois guarda-lamas traseiros, típicos do modelo. Sem perfuração.", "severity": "media", "repair": 300, "prevents_driving": false },
    { "area": "eletronica", "title": "Ar condicionado não funciona", "description": "O compressor do ar condicionado não engata. Provável necessidade de substituição do compressor ou recarga com deteção de fuga.", "severity": "media", "repair": 350, "prevents_driving": false }
  ]
}
$json$::jsonb);

select pg_temp.seed_listing($json$
{
  "stand": "auto-demo-lisboa", "brand": "ford", "model": "fiesta",
  "version": "1.25 Trend", "year": 2009, "month": 11, "price": 4700, "mileage": 132000,
  "fuel": "gasolina", "cc": 1242, "hp": 82, "gearbox": "manual", "doors": 5,
  "district": "Lisboa", "municipality": "Lisboa", "inspection": "2027-03-12",
  "keys": 2, "owners": 1, "maintenance": "Sempre assistido em concessionário até 2020; depois em oficina da confiança do anterior proprietário. Livro de revisões disponível.",
  "description": "Fiesta de único dono com quilometragem baixa para o ano. Muito bem estimado, sem problemas conhecidos. Reservado no momento — contacte o stand para saber se a reserva se mantém.",
  "status": "reservado", "slug": "ford-fiesta-2009-lisboa-4700", "views": 503, "days_ago": 14,
  "conditions": { "pneus": "desgaste_normal" }
}
$json$::jsonb);

select pg_temp.seed_listing($json$
{
  "stand": "auto-demo-lisboa", "brand": "fiat", "model": "punto",
  "version": "1.2 8v Active", "year": 2003, "month": 5, "price": 1750, "mileage": 176000,
  "fuel": "gasolina", "cc": 1242, "hp": 60, "gearbox": "manual", "doors": 3,
  "district": "Setúbal", "municipality": "Almada", "inspection": "2026-10-02",
  "keys": 1, "owners": 3, "maintenance": "Sem histórico de manutenção documentado.",
  "description": "Punto barato para cidade ou para quem sabe mexer em carros. A suspensão dianteira precisa de intervenção — declarado abaixo. O carro circula, mas com folgas audíveis.",
  "status": "publicado", "slug": "fiat-punto-2003-almada-1750", "views": 268, "days_ago": 2,
  "conditions": { "motor_mecanica": "precisa_atencao", "carrocaria_pintura": "desgaste_normal", "interior": "precisa_atencao", "eletronica": "nao_verificado" },
  "issues": [
    { "area": "motor_mecanica", "title": "Suspensão dianteira com folgas", "description": "Apoios e bieletas da suspensão dianteira com folgas audíveis em piso irregular. Recomenda-se substituição antes da próxima inspeção.", "severity": "alta", "repair": 280, "prevents_driving": false },
    { "area": "interior", "title": "Elevador do vidro do condutor lento", "description": "O vidro elétrico do lado do condutor sobe com dificuldade; provável desgaste do mecanismo elevador.", "severity": "baixa", "repair": 90, "prevents_driving": false }
  ]
}
$json$::jsonb);

select pg_temp.seed_listing($json$
{
  "stand": "auto-demo-lisboa", "brand": "citroen", "model": "c3",
  "version": "1.1i SX", "year": 2006, "month": 7, "price": 2950, "mileage": 158000,
  "fuel": "gasolina", "cc": 1124, "hp": 61, "gearbox": "manual", "doors": 5,
  "district": "Lisboa", "municipality": "Loures", "inspection": "2026-12-18",
  "keys": 2, "owners": 2, "maintenance": "Revisão de óleo e filtros feita pelo stand na entrada em stock.",
  "description": "C3 prático e económico. Pequenas amolgadelas de estacionamento nas duas portas do lado direito, sem ferrugem, declaradas abaixo.",
  "status": "publicado", "slug": "citroen-c3-2006-loures-2950", "views": 155, "days_ago": 1,
  "conditions": { "carrocaria_pintura": "problema_declarado", "pneus": "sem_problema" },
  "issues": [
    { "area": "carrocaria_pintura", "title": "Amolgadelas de estacionamento no lado direito", "description": "Duas amolgadelas pequenas nas portas do lado direito, apenas estéticas. Possível reparação sem pintura.", "severity": "baixa", "repair": 180, "prevents_driving": false }
  ]
}
$json$::jsonb);

select pg_temp.seed_listing($json$
{
  "stand": "auto-demo-lisboa", "brand": "mercedes-benz", "model": "classe-a",
  "version": "A 140 Classic", "year": 2000, "month": 3, "price": 1990, "mileage": 197000,
  "fuel": "gasolina", "cc": 1397, "hp": 82, "gearbox": "automatica", "doors": 5,
  "district": "Lisboa", "municipality": "Sintra", "inspection": "2026-09-30",
  "keys": 1, "owners": 3, "maintenance": "Sem histórico documentado. Caixa automática testada pelo stand em estrada.",
  "description": "Classe A automático de baixo custo. A inspeção está próxima do fim e existe uma avaria elétrica no vidro traseiro esquerdo, declarada abaixo. Ideal como carro de cidade.",
  "status": "publicado", "slug": "mercedes-benz-classe-a-2000-sintra-1990", "views": 96, "days_ago": 4,
  "conditions": { "eletronica": "problema_declarado", "documentacao": "precisa_atencao", "carrocaria_pintura": "desgaste_normal", "motor_mecanica": "nao_verificado" },
  "issues": [
    { "area": "eletronica", "title": "Vidro elétrico traseiro esquerdo inoperacional", "description": "O vidro traseiro esquerdo não responde ao comando. Provável avaria no motor do elevador.", "severity": "baixa", "repair": 120, "prevents_driving": false },
    { "area": "documentacao", "title": "Inspeção a expirar em breve", "description": "A inspeção periódica é válida apenas até setembro de 2026; o comprador deve contar com nova inspeção em breve.", "severity": "baixa", "repair": null, "prevents_driving": false }
  ]
}
$json$::jsonb);

select pg_temp.seed_listing($json$
{
  "stand": "algarve-retomas-demo", "brand": "seat", "model": "ibiza",
  "version": "1.4 TDI Reference", "year": 2008, "month": 10, "price": 4200, "mileage": 209000,
  "fuel": "gasoleo", "cc": 1422, "hp": 80, "gearbox": "manual", "doors": 5,
  "district": "Faro", "municipality": "Faro", "inspection": "2027-02-28",
  "keys": 2, "owners": 2, "maintenance": "Manutenção regular; distribuição substituída aos 180.000 km com fatura.",
  "description": "Ibiza TDI com inspeção válida por mais de um ano. Sem problemas conhecidos além do desgaste normal de utilização.",
  "status": "publicado", "slug": "seat-ibiza-2008-faro-4200", "views": 301, "days_ago": 6,
  "conditions": { "interior": "desgaste_normal", "pneus": "desgaste_normal" }
}
$json$::jsonb);

select pg_temp.seed_listing($json$
{
  "stand": "algarve-retomas-demo", "brand": "toyota", "model": "yaris",
  "version": "1.0 VVT-i Sol", "year": 2001, "month": 1, "price": 2500, "mileage": 243000,
  "fuel": "gasolina", "cc": 998, "hp": 68, "gearbox": "manual", "doors": 5,
  "district": "Faro", "municipality": "Portimão", "inspection": "2027-07-15",
  "keys": 2, "owners": 2, "maintenance": "Manutenção sempre em dia, com registos desde 2010. Motor sem consumos de óleo.",
  "description": "Yaris fiável com muitos quilómetros mas excelente manutenção. Vendido — mantido no site como exemplo de anúncio concluído.",
  "status": "vendido", "slug": "toyota-yaris-2001-portimao-2500", "views": 634, "days_ago": 21,
  "conditions": { "carrocaria_pintura": "desgaste_normal", "interior": "desgaste_normal" }
}
$json$::jsonb);

-- ------------------------------------------------------------
-- 6) Leads de demonstração
-- ------------------------------------------------------------
insert into public.leads (listing_id, stand_id, name, email, phone, message, rgpd_consent, status, ip_hash)
select l.id, l.stand_id, d.name, d.email, d.phone, d.message, true, d.status::public.lead_status, 'seed'
from (values
  ('opel-corsa-2004-guimaraes-2450', 'João Interessado (demo)', 'joao.demo@example.com', '911111111',
   'Boa tarde, o Corsa ainda está disponível? Gostava de o ver este sábado de manhã.', 'novo'),
  ('renault-clio-2007-braga-3200', 'Ana Compradora (demo)', 'ana.demo@example.com', '922222222',
   'A estimativa da embraiagem inclui mão de obra? Aceitam retoma de um Punto de 2001?', 'contactado'),
  ('fiat-punto-2003-almada-1750', 'Miguel Mecânico (demo)', 'miguel.demo@example.com', null,
   'Tenho oficina própria, interessa-me para revenda. Qual é o melhor preço a pronto?', 'novo')
) as d(slug, name, email, phone, message, status)
join public.listings l on l.slug = d.slug;

-- Registo de auditoria inicial
insert into public.admin_audit_log (admin_id, action, entity_type, entity_id, details)
values ('00000000-0000-4000-a000-000000000001', 'seed', 'plataforma', null,
        '{"nota": "Dados de demonstração carregados"}');
