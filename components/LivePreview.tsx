"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useMemo, useState } from "react";

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: "768px", icon: Tablet },
  { id: "mobile", label: "Mobile", width: "390px", icon: Smartphone },
] as const;

function buildDocument(html: string, theme: "dark" | "light") {
  const dark = theme === "dark";
  return `<!DOCTYPE html>
<html lang="en" class="${dark ? "dark" : ""}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.tailwindcss.com"></script>
<style>
  html, body { margin: 0; }
  body { background: ${dark ? "#020617" : "#ffffff"}; color: ${dark ? "#e2e8f0" : "#0f172a"}; font-family: system-ui, sans-serif; }
</style>
</head>
<body>
${html}
</body>
</html>`;
}

export function LivePreview({ html, theme }: { html: string; theme: "dark" | "light" }) {
  const [viewport, setViewport] = useState<(typeof VIEWPORTS)[number]["id"]>("desktop");
  const doc = useMemo(() => buildDocument(html, theme), [html, theme]);
  const width = VIEWPORTS.find((v) => v.id === viewport)!.width;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end gap-1" role="radiogroup" aria-label="Preview width">
        {VIEWPORTS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={viewport === id}
            aria-label={label}
            title={label}
            onClick={() => setViewport(id)}
            className={
              "rounded-md p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-400 " +
              (viewport === id ? "bg-slate-700 text-slate-50" : "text-slate-500 hover:text-slate-200")
            }
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
        <div className="mx-auto transition-[width] duration-200" style={{ width, maxWidth: "100%" }}>
          {}
          <iframe title="Live preview of generated component" sandbox="allow-scripts" srcDoc={doc} className="block h-136 w-full bg-white" />
        </div>
      </div>
      <p className="text-xs text-slate-500">Preview loads Tailwind from its CDN. The exported code expects Tailwind in your own project.</p>
    </div>
  );
}