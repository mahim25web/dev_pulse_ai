// Shared by the API route and the UI so both enforce the same limits.
export const MAX_PROMPT_CHARS = 30_000;

// Vercel serverless functions reject request bodies over 4.5 MB.
// Base64 inflates data by ~33%, so cap the encoded image at 4,000,000 chars (~3 MB).
export const MAX_IMAGE_BASE64_CHARS = 4_000_000;

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
