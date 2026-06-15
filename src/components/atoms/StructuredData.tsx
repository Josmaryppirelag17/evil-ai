const SITE_URL = process.env.APP_URL ?? "https://vil-assistant.vercel.app";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "AI Study Assistant",
      description: "Asistente de estudio con inteligencia artificial. Chat, búsqueda web y herramientas para estudiantes.",
      inLanguage: "es",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: "AI Study Assistant",
      url: SITE_URL,
      applicationCategory: "Educational Application",
      operatingSystem: "Any",
    },
  ],
};

export function StructuredData({ nonce }: { nonce: string }) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
