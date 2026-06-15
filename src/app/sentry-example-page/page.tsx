"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

export default function SentryExamplePage() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const triggerError = () => {
    setStatus("idle");
    try {
      throw new Error("Sentry test error from client");
    } catch (e) {
      Sentry.captureException(e);
      setStatus("error");
    }
  };

  const triggerApiError = async () => {
    setStatus("idle");
    const res = await fetch("/api/sentry-example");
    if (res.ok) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Sentry Test Page</h1>
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        Click the buttons to trigger test errors and verify Sentry captures them.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button
          onClick={triggerError}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#e53e3e",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Trigger Client Error
        </button>

        <button
          onClick={triggerApiError}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#3182ce",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Trigger API Error
        </button>
      </div>

      {status === "error" && (
        <p style={{ marginTop: "1rem", color: "#e53e3e" }}>
          Error sent to Sentry. Check your dashboard.
        </p>
      )}
      {status === "success" && (
        <p style={{ marginTop: "1rem", color: "#38a169" }}>
          API error sent to Sentry. Check your dashboard.
        </p>
      )}

      <p style={{ marginTop: "2rem", fontSize: "0.8rem", color: "#999" }}>
        Sentry Project: vil-nextjs
      </p>
    </main>
  );
}
