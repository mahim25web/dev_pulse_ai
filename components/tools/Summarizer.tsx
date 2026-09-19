"use client";

import { AlignLeft, X } from "lucide-react";
import { useState } from "react";

import { OutputPanel } from "@/components/OutputPanel";
import { ToolLayout } from "@/components/ToolLayout";
import { Field, GhostButton, PrimaryButton, textareaClass } from "@/components/ui";
import { MAX_PROMPT_CHARS } from "@/lib/limits";
import { useGenerate } from "@/lib/useGenerate";

export function Summarizer() {
  const [text, setText] = useState("");
  const { result, loading, error, run, reset } = useGenerate();

  const canSubmit = text.trim().length > 0 && !loading;

  function submit() {
    if (canSubmit) run({ tool: "summarizer", prompt: text });
  }

  return (
    <ToolLayout
      title="Article summarizer"
      description="Paste an article, doc, or thread. You get a short summary and the key takeaways as bullets."
      input={
        <>
          <Field label="Text to summarise" hint={`${text.length.toLocaleString()} / ${MAX_PROMPT_CHARS.toLocaleString()}`}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
              maxLength={MAX_PROMPT_CHARS}
              rows={16}
              placeholder="Paste the article text here"
              className={textareaClass}
            />
          </Field>
          <div className="flex items-center gap-2">
            <PrimaryButton onClick={submit} disabled={!canSubmit} loading={loading}>
              <AlignLeft className="h-4 w-4" aria-hidden />
              Summarise
            </PrimaryButton>
            <GhostButton
              onClick={() => {
                setText("");
                reset();
              }}
              disabled={!text && !result}
            >
              <X className="h-4 w-4" aria-hidden />
              Clear
            </GhostButton>
          </div>
        </>
      }
      output={
        <OutputPanel
          loading={loading}
          error={error}
          result={result}
          loadingLabel="Reading the article"
          emptyTitle="Your summary shows up here"
          emptyHint="Paste at least a few paragraphs to get useful takeaways."
        />
      }
    />
  );
}
