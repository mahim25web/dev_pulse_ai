"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GenerateRequest } from "./types";

export function useGenerate() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = useCallback(async (payload: GenerateRequest) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status}).`);
      setResult(data.text);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setResult("");
    setError(null);
    setLoading(false);
  }, []);

  return { result, loading, error, run, reset };
}
