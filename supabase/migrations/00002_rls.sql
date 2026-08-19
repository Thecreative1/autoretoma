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
