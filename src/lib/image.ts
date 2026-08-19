"use client";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Reduz a imagem no browser antes do upload: limita o lado maior a 1600 px
 * e converte para JPEG com qualidade 0.82. Poupa largura de banda e mantém
 * os ficheiros dentro do limite do bucket.
 */
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.82)
  );
  return blob ?? file;
}

export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Formato não suportado. Utilize JPEG, PNG ou WebP.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "A fotografia excede 5 MB.";
  }
  return null;
}
