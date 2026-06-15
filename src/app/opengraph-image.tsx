import { ImageResponse } from "next/og";

export const alt = "VIL — Asistente Villano";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #03070b 0%, #0a1628 50%, #03070b 100%)",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            display: "flex",
            inset: 0,
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.03) 2px, rgba(0,240,255,0.03) 4px)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(0,240,255,0.4)",
            padding: "40px 80px",
            borderRadius: "4px",
            background: "rgba(0,240,255,0.05)",
            boxShadow: "0 0 60px rgba(0,240,255,0.15)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              color: "#00f0ff",
              letterSpacing: "12px",
              textShadow: "0 0 30px rgba(0,240,255,0.6)",
              marginBottom: 16,
            }}
          >
            VIL
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#00ff66",
              letterSpacing: "6px",
              opacity: 0.9,
              textShadow: "0 0 20px rgba(0,255,102,0.4)",
              marginBottom: 8,
            }}
          >
            ASISTENTE VILLANO
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 14,
              color: "#64748b",
              letterSpacing: "3px",
              marginTop: 8,
            }}
          >
            AI CON NAVEGADOR VIRTUAL Y BUSQUEDA EN GOOGLE
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 24,
            display: "flex",
            gap: 16,
            fontSize: 11,
            color: "rgba(0,240,255,0.3)",
            letterSpacing: "2px",
          }}
        >
          <span>CYBER TERMINAL</span>
          <span>V.1.0</span>
          <span>AI-POWERED</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
