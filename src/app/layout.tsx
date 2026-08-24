import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { StructuredData } from "@/components/StructuredData";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Carros baratos, sem surpresas escondidas`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Retomas e carros de baixo valor vendidos diretamente por stands portugueses, com os defeitos conhecidos apresentados de forma clara.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — Carros baratos, sem surpresas escondidas`,
    description:
      "Retomas e carros de baixo valor vendidos diretamente por stands, com o que está bem e o que está mal explicado antes de perderes tempo.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Carros baratos, sem surpresas escondidas`,
    description:
      "Retomas e carros de baixo valor vendidos diretamente por stands portugueses.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${archivo.variable}`}>
      <body className="flex min-h-screen flex-col">
        <StructuredData />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-900 focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar para o conteúdo principal
        </a>
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
