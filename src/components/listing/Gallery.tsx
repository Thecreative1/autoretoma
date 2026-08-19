"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { ListingPhoto } from "@/lib/types";
import { PHOTO_CATEGORY_LABELS } from "@/lib/constants";

export function Gallery({ photos, title }: { photos: ListingPhoto[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const current = photos[index];

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + photos.length) % photos.length);
    },
    [photos.length]
  );

  useEffect(() => {
    if (!fullscreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fullscreen, go]);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-card bg-brand-100 text-brand-500">
        Sem fotografias
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-brand-100">
          <Image
            src={current.url}
            alt={`${title} — ${PHOTO_CATEGORY_LABELS[current.category]}${
              current.is_defect ? " (fotografia de defeito)" : ""
            }`}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
          {current.is_defect && (
            <span className="badge absolute left-3 top-3 bg-accent-500 text-white">
              Fotografia de defeito
            </span>
          )}
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="absolute bottom-3 right-3 rounded-lg bg-brand-950/80 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-950"
          >
            Ver em ecrã completo
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-brand-900 shadow hover:bg-white"
                aria-label="Fotografia anterior"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-brand-900 shadow hover:bg-white"
                aria-label="Fotografia seguinte"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {photos.map((photo, i) => (
            <li key={photo.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "true" : undefined}
                aria-label={`Ver ${PHOTO_CATEGORY_LABELS[photo.category]}${
                  photo.is_defect ? " (defeito)" : ""
                }`}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-lg border-2 transition-colors ${
                  i === index
                    ? "border-accent-500"
                    : photo.is_defect
                      ? "border-accent-200"
                      : "border-transparent hover:border-brand-300"
                }`}
              >
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                {photo.is_defect && (
                  <span className="absolute inset-x-0 bottom-0 bg-accent-500/95 px-1 py-0.5 text-[10px] font-bold uppercase leading-tight text-white">
                    Defeito
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-brand-950/95"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria em ecrã completo"
        >
          <div className="flex items-center justify-between p-4 text-white">
            <p className="text-sm">
              {index + 1} / {photos.length} — {PHOTO_CATEGORY_LABELS[current.category]}
              {current.is_defect && " · Fotografia de defeito"}
            </p>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="rounded-lg border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              Fechar
            </button>
          </div>
          <div className="relative flex-1">
            <Image
              src={current.url}
              alt={`${title} — ${PHOTO_CATEGORY_LABELS[current.category]}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {photos.length > 1 && (
            <div className="flex items-center justify-center gap-4 p-4">
              <button type="button" onClick={() => go(-1)} className="btn-outline">
                Anterior
              </button>
              <button type="button" onClick={() => go(1)} className="btn-outline">
                Seguinte
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
