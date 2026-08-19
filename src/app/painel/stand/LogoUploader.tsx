"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage, validateImage } from "@/lib/image";
import { updateStandLogo } from "./actions";

export function LogoUploader({
  userId,
  currentLogo,
}: {
  userId: string;
  currentLogo: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const blob = await compressImage(file);
      const path = `${userId}/logo-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, blob, { contentType: "image/jpeg", upsert: true });

      if (uploadError) {
        setError(`Não foi possível carregar o logótipo: ${uploadError.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(path);

      const fd = new FormData();
      fd.set("logo_url", publicUrl);
      await updateStandLogo(fd);
      startTransition(() => router.refresh());
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const busy = uploading || isPending;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card border border-brand-200 bg-brand-50">
        {currentLogo ? (
          <Image src={currentLogo} alt="Logótipo do stand" fill sizes="80px" className="object-contain" />
        ) : (
          <span className="flex h-full items-center justify-center text-center text-xs text-brand-400">
            Sem logótipo
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <label htmlFor="logo-input" className="label">Carregar novo logótipo</label>
        <input
          ref={inputRef}
          id="logo-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="block w-full text-sm text-brand-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-800 disabled:opacity-60"
        />
        <p className="mt-1 text-xs text-brand-500">JPEG, PNG ou WebP até 5 MB.</p>
        {busy && <p role="status" className="mt-2 text-sm text-brand-700">A carregar…</p>}
        {error && (
          <p role="alert" className="mt-2 rounded-lg bg-red-50 p-2.5 text-sm text-red-800">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
