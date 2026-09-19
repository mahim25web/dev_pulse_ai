"use client";

import { Languages } from "lucide-react";
import { useState } from "react";

import { CopyButton } from "@/components/CodeBlock";
import { OutputPanel } from "@/components/OutputPanel";
import { ToolLayout } from "@/components/ToolLayout";
import { Field, PrimaryButton, Segmented, textareaClass } from "@/components/ui";
import { MAX_PROMPT_CHARS } from "@/lib/limits";
import type { ToolOptions } from "@/lib/types";
import { useGenerate } from "@/lib/useGenerate";

export function Translator() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"translate" | "social">("translate");
  const [direction, setDirection] = useState<"auto" | "en-bn" | "bn-en">("auto");
  const [platform, setPlatform] = useState<"linkedin" | "facebook">("linkedin");
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const { result, loading, error, run } = useGenerate();

  const canSubmit = text.trim().length > 0 && !loading;

  function submit() {
    if (!canSubmit) return;
    const options: ToolOptions = mode === "translate" ? { mode, direction } : { mode, platform, language };
    run({ tool: "translator", prompt: text, options });
  }

  return (
    <ToolLayout
      title="Translate & post"
      description="Translate between English and Bengali, or turn rough notes into a post that is ready for LinkedIn or Facebook."
      input={
        <>
          <Segmented
            label="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "translate", label: "Translate" },
              { value: "social", label: "Social post" },
            ]}
          />

          <Field label={mode === "translate" ? "Text to translate" : "What is the post about?"} hint={`${text.length.toLocaleString()} / ${MAX_PROMPT_CHARS.toLocaleString()}`}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
              maxLength={MAX_PROMPT_CHARS}
              rows={10}
              placeholder={
                mode === "translate"
                  ? "Type or paste English or Bengali text"
                  : "Shipped my first full-stack app this week. Next.js, Supabase, deployed on Vercel. Learned a lot about auth."
              }
              className={textareaClass}
            />
          </Field>

          <div className="flex flex-wrap items-center gap-3">
            {mode === "translate" ? (
              <Segmented
                label="Direction"
                value={direction}
                onChange={setDirection}
                options={[
                  { value: "auto", label: "Auto-detect" },
                  { value: "en-bn", label: "English to Bengali" },
                  { value: "bn-en", label: "Bengali to English" },
                ]}
              />
            ) : (
              <>
                <Segmented
                  label="Platform"
                  value={platform}
                  onChange={setPlatform}
                  options={[
                    { value: "linkedin", label: "LinkedIn" },
                    { value: "facebook", label: "Facebook" },
                  ]}
                />
                <Segmented
                  label="Post language"
                  value={language}
                  onChange={setLanguage}
                  options={[
                    { value: "en", label: "English" },
                    { value: "bn", label: "Bengali" },
                  ]}
                />
              </>
            )}
          </div>

          <div>
            <PrimaryButton onClick={submit} disabled={!canSubmit} loading={loading}>
              <Languages className="h-4 w-4" aria-hidden />
              {mode === "translate" ? "Translate" : "Write post"}
            </PrimaryButton>
          </div>
        </>
      }
      output={
        <OutputPanel
          loading={loading}
          error={error}
          result={result}
          loadingLabel={mode === "translate" ? "Translating" : "Writing your post"}
          emptyTitle={mode === "translate" ? "Your translation shows up here" : "Your post shows up here"}
          emptyHint={mode === "translate" ? "Auto-detect sends Bengali to English and everything else to Bengali." : "Emojis and hashtags are added for you. Edit before you publish."}
        >
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <CopyButton text={result} label="Copy text" />
            </div>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-100">{result}</p>
          </div>
        </OutputPanel>
      }
    />
  );
}
