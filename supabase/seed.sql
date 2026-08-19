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
