import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, type Part } from "@google/genai";

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BASE64_CHARS, MAX_PROMPT_CHARS } from "@/lib/limits";
import {
  buildSystemInstruction,
  buildUserPrompt,
  modelConfigFor,
  sanitizeOptions,
} from "@/lib/prompts";
import { rateLimit } from "@/lib/rateLimit";
import type { ToolId } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60; 


const PRIMARY_MODEL = "gemini-3.6-flash";
const FALLBACK_MODEL = "gemini-1.5-flash";

const TOOLS: readonly ToolId[] = ["solver", "ui", "summarizer", "translator"];

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

const fail = (error: string, status: number, headers?: HeadersInit) =>
  NextResponse.json({ error }, { status, headers });

export async function POST(req: NextRequest) {
  const ai = getClient();
  if (!ai) {
    console.error("GEMINI_API_KEY is not set.");
    return fail("The server is not configured yet. Please try again later.", 500);
  }

  
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return fail(`Too many requests. Try again in ${limit.retryAfter}s.`, 429, {
      "Retry-After": String(limit.retryAfter),
    });
  }

  
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("Request body must be valid JSON.", 400);
  }

  const tool = body.tool as ToolId;
  if (!TOOLS.includes(tool)) return fail("Unknown tool.", 400);

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (prompt.length > MAX_PROMPT_CHARS) {
    return fail(`Text is too long. The limit is ${MAX_PROMPT_CHARS.toLocaleString()} characters.`, 413);
  }

  let image: { data: string; mimeType: string } | undefined;
  if (body.image) {
    const raw = body.image as { data?: unknown; mimeType?: unknown };
    const mimeType = typeof raw.mimeType === "string" ? raw.mimeType : "";
    const data = typeof raw.data === "string" ? raw.data.replace(/^data:[^;]+;base64,/, "") : "";

    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType)) {
      return fail("Unsupported image type. Use PNG, JPEG, or WebP.", 400);
    }
    if (!data || !/^[A-Za-z0-9+/=\s]+$/.test(data)) {
      return fail("Image data is not valid base64.", 400);
    }
    if (data.length > MAX_IMAGE_BASE64_CHARS) {
      return fail("Image is too large. Crop or resize the screenshot and try again.", 413);
    }
    image = { data, mimeType };
  }

  if (!prompt && !image) return fail("Add some text or an image first.", 400);

  
  const parts: Part[] = [
    { text: buildUserPrompt(tool, prompt, sanitizeOptions(body.options), Boolean(image)) },
  ];
  if (image) {
    parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    });
  }

  const { temperature, thinkingBudget } = modelConfigFor(tool);
  const config: Record<string, any> = {
    systemInstruction: buildSystemInstruction(tool),
    temperature,
    maxOutputTokens: 8192,
  };

  if (thinkingBudget !== undefined && thinkingBudget !== null) {
    config.thinkingConfig = { thinkingBudget };
  }

  
  const callModel = async (modelName: string) => {
    return await ai.models.generateContent({
      model: modelName,
      contents: parts,
      config,
    });
  };

  try {
    let response;
    try {
     
      response = await callModel(PRIMARY_MODEL);
    } catch (primaryErr: any) {
      const status = primaryErr?.status || primaryErr?.statusCode;
      if (status === 503 || status === 429) {
        console.warn(`[Gemini API] Primary model (${PRIMARY_MODEL}) busy/503. Retrying with ${FALLBACK_MODEL}...`);
        response = await callModel(FALLBACK_MODEL);
      } else {
        throw primaryErr;
      }
    }

    const text = response.text?.trim();
    if (!text) {
      const reason = response.candidates?.[0]?.finishReason ?? response.promptFeedback?.blockReason;
      console.warn("Empty Gemini response:", reason);
      return fail(
        "The model returned no answer (it may have been blocked or cut off). Try rephrasing or shortening your input.",
        502,
      );
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("Gemini request failed:", err);
    const status = err?.status || err?.statusCode;
    if (status === 503) {
      return fail("The AI service is temporarily over capacity. Please click Solve again in a few seconds.", 503);
    }
    if (status === 429) {
      return fail("The AI service is busy right now. Wait a moment and try again.", 429);
    }
    if (status === 400) {
      return fail("The AI service could not process that input. Try simplifying it.", 400);
    }
    return fail(err?.message || "Something went wrong while generating. Please try again.", 500);
  }
}