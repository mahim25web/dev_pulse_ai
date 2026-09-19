"use client";

import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { CodeBlock } from "@/components/CodeBlock";
import { LivePreview } from "@/components/LivePreview";
import { Markdown } from "@/components/Markdown";
import { OutputPanel } from "@/components/OutputPanel";
import { ToolLayout } from "@/components/ToolLayout";
import { Field, PrimaryButton, Segmented, textareaClass } from "@/components/ui";
import { MAX_PROMPT_CHARS } from "@/lib/limits";
import { extractCodeBlock } from "@/lib/markdown";
import { useGenerate } from "@/lib/useGenerate";

const EXAMPLES = [
  "Hero section for a portfolio",
  "Pricing table with three plans",
  "Responsive navbar with mobile menu",
  "Login card with social sign-in buttons",
];

export function UIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [renderedTheme, setRenderedTheme] = useState<"dark" | "light">("dark");
  const [view, setView] = useState<"preview" | "code">("preview");
  const { result, loading, error, run } = useGenerate();

  const parsed = useMemo(() => (result ? extractCodeBlock(result, "html") : null), [result]);
  const canSubmit = prompt.trim().length > 0 && !loading;

  function submit() {
    if (!canSubmit) return;
    setRenderedTheme(theme);
    setView("preview");
    run({ tool: "ui", prompt, options: { theme } });
  }

  return (
    <ToolLayout
      title="UI generator"
      description="Describe a component or section. You get complete HTML with Tailwind classes, plus a live preview you can resize."
      input={
        <>
          <Field label="What should it look like?" hint={`${prompt.length.toLocaleString()} / ${MAX_PROMPT_CHARS.toLocaleString()}`}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
              maxLength={MAX_PROMPT_CHARS}
              rows={6}
              placeholder="Hero section for a portfolio: name, one-line bio, two buttons, and a row of tech stack badges"
              className={textareaClass}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-400"
              >
                {ex}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Theme"
              value={theme}
              onChange={setTheme}
              options={[
                { value: "dark", label: "Dark" },
                { value: "light", label: "Light" },
              ]}
            />
            <PrimaryButton onClick={submit} disabled={!canSubmit} loading={loading}>
              <Sparkles className="h-4 w-4" aria-hidden />
              Generate
            </PrimaryButton>
          </div>
        </>
      }
      output={
        <OutputPanel
          loading={loading}
          error={error}
          result={result}
          loadingLabel="Building your component"
          emptyTitle="Your component shows up here"
          emptyHint="Pick an example or describe your own. Switch between preview and code once it is ready."
        >
          {parsed ? (
            <div className="flex flex-col gap-4">
              <Segmented
                label="Output view"
                value={view}
                onChange={setView}
                options={[
                  { value: "preview", label: "Preview" },
                  { value: "code", label: "Code" },
                ]}
              />
              {view === "preview" ? (
                <LivePreview html={parsed.code} theme={renderedTheme} />
              ) : (
                <CodeBlock code={parsed.code} language={parsed.lang || "html"} />
              )}
              {parsed.rest && <Markdown source={parsed.rest} />}
            </div>
          ) : (
            <Markdown source={result} />
          )}
        </OutputPanel>
      }
    />
  );
}
