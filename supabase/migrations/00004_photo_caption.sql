-- ============================================================
-- AutoRetoma — 00004: Legenda das fotografias "Outra"
-- ============================================================
-- As categorias obrigatórias descrevem-se a si próprias ("Motor", "Frontal").
-- "Outra" não diz nada ao comprador, por isso passa a aceitar uma legenda curta
-- escrita pelo stand ("Porta-bagagens", "Pneu traseiro esquerdo").

alter table public.listing_photos
  add column if not exists caption text
    check (caption is null or char_length(btrim(caption)) between 2 and 80);

comment on column public.listing_photos.caption is
  'Legenda curta escrita pelo stand. Usada nas fotografias de categoria "outra", que de outro modo nada dizem ao comprador.';
