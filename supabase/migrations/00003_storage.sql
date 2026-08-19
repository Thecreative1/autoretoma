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
