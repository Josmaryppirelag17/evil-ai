import type { Metadata } from "next";
import { TerminalConsolePage } from "@/components/organisms/TerminalConsolePage";

const APP_URL = process.env.APP_URL || "https://vil-assistant.vercel.app";

export const metadata: Metadata = {
  title: "Inicio | E-VIL — Asistente Villano",
  description:
    "Interfaz de terminal cyberpunk para interactuar con E-VIL, un asistente AI con personalidad de villano, búsqueda en Google y navegador virtual.",
  openGraph: {
    title: "Inicio | E-VIL — Asistente Villano",
    description:
      "Interfaz de terminal cyberpunk para interactuar con E-VIL, un asistente AI con personalidad de villano.",
    url: APP_URL,
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <TerminalConsolePage />;
}
