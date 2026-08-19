/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Necessário para as imagens de demonstração em SVG; os uploads reais
    // estão limitados a JPEG/PNG/WebP pelas regras do bucket.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
