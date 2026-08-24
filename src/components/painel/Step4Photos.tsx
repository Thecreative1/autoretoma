"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addPhoto, deletePhoto } from "@/app/painel/anuncios/actions";
import { compressImage, validateImage } from "@/lib/image";
import { PHOTO_CATEGORIES, PHOTO_CATEGORY_LABELS } from "@/lib/constants";
import type { ListingPhoto, PhotoCategory } from "@/lib/types";

export function Step4Photos({
  listingId,
  userId,
  photos,
  minPhotos,
}: {
  listingId: string;
  userId: string;
  photos: ListingPhoto[];
  minPhotos: number;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<PhotoCategory>("frontal");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const present = new Set(photos.map((p) => p.category));
  const missingRequired = PHOTO_CATEGORIES.filter((c) => c.required && !present.has(c.value));

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    const supabase = createClient();
    const uploaded: PhotoCategory[] = [];

    try {
      for (const file of Array.from(files)) {
        const validationError = validateImage(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        const blob = await compressImage(file);
        // A política de storage exige que a primeira pasta seja o id do utilizador.
        const path = `${userId}/${listingId}/${crypto.randomUUID()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });

        if (uploadError) {
          console.error("upload de fotografia:", uploadError.message);
          setError(
            "Não foi possível carregar a fotografia. Verifique a ligação à Internet e tente novamente. Se o problema continuar, escreva para contacto@autoretoma.pt."
          );
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("listings").getPublicUrl(path);

        const fd = new FormData();
        fd.set("listing_id", listingId);
        fd.set("url", publicUrl);
        fd.set("category", category);
        const result = await addPhoto(fd);
        if (!result.ok && result.message) setError(result.message);
        else uploaded.push(category);
      }

      // Avança automaticamente para a próxima categoria obrigatória em falta,
      // para o stand não ter de mexer no seletor a cada fotografia.
      const done = new Set([...present, ...uploaded]);
      const next = PHOTO_CATEGORIES.find((c) => c.required && !done.has(c.value));
      if (next) setCategory(next.value);

      startTransition(() => router.refresh());
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const busy = uploading || isPending;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg font-bold">Fotografias</h3>
        <p className="mt-1 text-sm text-brand-600">
          São necessárias pelo menos {minPhotos} fotografias reais, incluindo frontal,
          traseira, as duas laterais, interior, quadrante com quilómetros e motor.
          Adicione também fotografias dos defeitos declarados.
        </p>
      </div>

      <div
        className={`rounded-card p-4 text-sm ${
          photos.length >= minPhotos && missingRequired.length === 0
            ? "bg-green-50 text-green-900"
            : "bg-amber-50 text-amber-900"
        }`}
        role="status"
      >
        <p>
          <strong>
            {photos.length} de {minPhotos} fotografias
          </strong>
          {missingRequired.length > 0 && (
            <> · Em falta: {missingRequired.map((c) => c.label).join(", ")}</>
          )}
          {photos.length >= minPhotos && missingRequired.length === 0 && (
            <> · Todas as fotografias obrigatórias estão presentes.</>
          )}
        </p>
      </div>

      <div className="card p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="photo-category" className="label">
              Categoria da fotografia a carregar
            </label>
            <select
              id="photo-category"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value as PhotoCategory)}
            >
              {PHOTO_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                  {c.required && !present.has(c.value) ? " (em falta)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="photo-input" className="label sm:sr-only">
              Escolher ficheiros
            </label>
            <input
              ref={inputRef}
              id="photo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={busy}
              onChange={(e) => handleFiles(e.target.files)}
              className="block w-full text-sm text-brand-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent-500 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-accent-600 disabled:opacity-60"
            />
          </div>
        </div>

        <p className="mt-2 text-xs text-brand-500">
          JPEG, PNG ou WebP até 5 MB. As imagens são redimensionadas automaticamente antes
          do envio.
        </p>

        {busy && (
          <p role="status" className="mt-3 text-sm font-medium text-brand-700">
            A carregar fotografias…
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}
      </div>

      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <li key={photo.id} className="card overflow-hidden">
              <div className="relative aspect-[4/3] bg-brand-100">
                <Image src={photo.url} alt="" fill sizes="200px" className="object-cover" />
                {photo.is_defect && (
                  <span className="badge absolute left-2 top-2 bg-accent-500 text-white">
                    Defeito
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5">
                <span className="truncate text-xs font-medium text-brand-700">
                  {PHOTO_CATEGORY_LABELS[photo.category]}
                </span>
                <form action={deletePhoto}>
                  <input type="hidden" name="listing_id" value={listingId} />
                  <input type="hidden" name="photo_id" value={photo.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-red-700 hover:text-red-800"
                  >
                    Remover
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between border-t border-brand-100 pt-5">
        <Link href={`/painel/anuncios/${listingId}?passo=3`} className="btn-outline">
          Voltar
        </Link>
        <Link href={`/painel/anuncios/${listingId}?passo=5`} className="btn-primary">
          Continuar para preço
        </Link>
      </div>
    </div>
  );
}
