-- ============================================================
-- AutoRetoma — 00005: O bucket de logótipos deixa de aceitar SVG
-- ============================================================
-- O bucket `logos` é público e aceitava `image/svg+xml`. Um SVG pode conter
-- JavaScript: um stand autenticado podia, contornando o interface (que já
-- converte tudo para JPEG), carregar um SVG malicioso para a sua pasta e servi-lo
-- inline. Os logótipos de demonstração em SVG vivem em `/public`, não no bucket,
-- pelo que este formato não é necessário aqui. Restringimos aos formatos raster.

update storage.buckets
  set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
  where id = 'logos';
