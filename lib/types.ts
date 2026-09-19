export type ToolId = "solver" | "ui" | "summarizer" | "translator";

export interface ImagePayload {
  /** Raw base64 (no "data:" prefix). */
  data: string;
  mimeType: string;
}

/** Per-tool options. Every value is validated against a whitelist on the server. */
export type ToolOptions = Partial<{
  theme: "dark" | "light";
  mode: "translate" | "social";
  direction: "auto" | "en-bn" | "bn-en";
  platform: "linkedin" | "facebook";
  language: "en" | "bn";
}>;

export interface GenerateRequest {
  tool: ToolId;
  prompt: string;
  options?: ToolOptions;
  image?: ImagePayload;
}

export interface GenerateResponse {
  text: string;
}

export interface ApiErrorBody {
  error: string;
}
