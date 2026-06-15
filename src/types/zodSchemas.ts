import { z } from "zod";

// Esquema para mensajes de chat
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().min(1, "El mensaje no puede estar vacío"),
});

// Esquema para solicitud de chat
export const ChatRequestSchema = z.object({
  query: z.string().min(1, "La consulta no puede estar vacía"),
  session_id: z.string().optional(),
  messages: z.array(ChatMessageSchema).optional(),
});

// Esquema para respuestas de chat (para validación de salida)
export const ChatResponseSchema = z.object({
  text: z.string(),
  groundingSources: z.array(
    z.object({
      title: z.string(),
      uri: z.string().url(),
      snippet: z.string(),
      index: z.number(),
    })
  ).optional(),
  searchQueries: z.array(z.string()).optional(),
});

// Esquema para solicitud de sugerencias
export const SuggestionsRequestSchema = z.object({
  context: z.string().optional(),
  limit: z.number().min(1).max(10).default(5),
});

// Esquema para solicitud de simulación de navegador
export const BrowserSimulateRequestSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  query: z.string().optional(),
  width: z.number().min(800).max(3840).default(1920),
  height: z.number().min(600).max(2160).default(1080),
});