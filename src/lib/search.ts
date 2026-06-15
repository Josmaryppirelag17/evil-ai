const SERPER_URL = "https://google.serper.dev/search";

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

interface SerperResponse {
  organic?: GoogleSearchResult[];
  knowledgeGraph?: { title: string; description?: string };
  error?: string;
}

function getApiKey(): string {
  const key = process.env.SERPER_API_KEY;
  if (!key) throw new Error("SERPER_API_KEY no configurada");
  return key;
}

export async function searchGoogle(query: string, limit = 10): Promise<GoogleSearchResult[]> {
  const apiKey = getApiKey();

  const response = await fetch(SERPER_URL, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: limit }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Serper error (${response.status}): ${text}`);
  }

  const data: SerperResponse = await response.json();

  if (data.error) throw new Error(`Serper API error: ${data.error}`);

  return (data.organic || []).slice(0, limit).map((r, i) => ({
    ...r,
    position: i + 1,
  }));
}
