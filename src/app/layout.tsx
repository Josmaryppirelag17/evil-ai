import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { cn } from "@/utils/utils";
import { I18nProvider } from "@/context/I18nProvider";
import { AuthProvider } from "@/context/AuthContext";
import { AuthButton } from "@/components/atoms/AuthButton";
import { StructuredData } from "@/components/atoms/StructuredData";
import { GAScript } from "@/components/atoms/GAScript";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
  fallback: ["Consolas", "Monaco", "monospace"],
});

const APP_URL = process.env.APP_URL || "https://vil-assistant.vercel.app";
const PORTFOLIO_URL = process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://josmarypirela.dev";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a1628",
};

export const metadata: Metadata = {
  title: {
    template: "%s | E-VIL — Asistente Villano",
    default: "E-VIL — Asistente Villano",
  },
  description:
    "Asistente AI con personalidad de villano, búsqueda en Google y navegador virtual cyber-terminal.",
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
    languages: { es: "/", en: "/" },
  },
  openGraph: {
    title: "E-VIL — Asistente Villano",
    description:
      "Asistente AI con personalidad de villano, búsqueda en Google y navegador virtual cyber-terminal.",
    url: APP_URL,
    siteName: "E-VIL — Asistente Villano",
    images: [{ url: `${APP_URL}/opengraph-image`, width: 1200, height: 630, alt: "VIL — Asistente Villano" }],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "E-VIL — Asistente Villano",
    description:
      "Asistente AI con personalidad de villano, búsqueda en Google y navegador virtual cyber-terminal.",
    images: [`${APP_URL}/opengraph-image`],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") ?? "";

  return (
    <html lang="es" className={cn("font-sans", geist.variable, jetbrainsMono.variable)} suppressHydrationWarning>
      <body>
        <StructuredData nonce={nonce} />
        <GAScript />
        <AuthProvider>
          <I18nProvider>
          <a href="#main-content" className="fixed left-0 top-0 z-50 -translate-y-full bg-cyber-cyan px-4 py-2 text-black font-mono text-xs transition-transform focus:translate-y-0">
            Saltar al contenido principal
          </a>
          <div id="main-content">{children}</div>
          <footer className="border-t border-cyber-cyan/10 bg-black/60 py-3 px-4 text-[9px] text-gray-500 font-mono text-center">
            <div className="flex items-center justify-center gap-4 mb-1">
              <AuthButton />
            </div>
            <p>
              <span>E-VIL Asistente Villano </span>
              <span className="text-cyber-cyan/30">|</span>
              <span> Creado por </span>
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyber-cyan/60 hover:text-cyber-cyan transition-colors underline underline-offset-2"
                aria-label="Abrir portafolio de Josmary Pirela en una nueva pestaña"
              >
                Josmary Pirela
              </a>
            </p>
            <p className="mt-1 text-gray-600">
              <a href="https://vil.josmarypirela.dev/" className="hover:text-cyber-cyan transition-colors">E-vil | Asistente Villano</a>
              {" © 2026 "}
              <a href="https://josmarypirela.dev/" className="hover:text-cyber-cyan transition-colors">Josmary Pirela</a>
              {" — "}
              <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" className="hover:text-cyber-cyan transition-colors" target="_blank" rel="noopener noreferrer">
                CC BY-NC-SA 4.0
              </a>
            </p>
          </footer>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
