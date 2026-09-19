"use client";

import { Wand2 } from "lucide-react";
import { useState } from "react";

import { ImageUploader } from "@/components/ImageUploader";
import { OutputPanel } from "@/components/OutputPanel";
import { ToolLayout } from "@/components/ToolLayout";
import { Field, PrimaryButton, textareaClass } from "@/components/ui";
import { fileToImage, imageFromClipboard, type PickedImage } from "@/lib/image";
import { MAX_PROMPT_CHARS } from "@/lib/limits";
import { useGenerate } from "@/lib/useGenerate";

export function CodeSolver() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<PickedImage | null>(null);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const { result, loading, error, run } = useGenerate();

  const canSubmit = (text.trim().length > 0 || image !== null) && !loading;

  function submit() {
    if (!canSubmit) return;
    run({
      tool: "solver",
      prompt: text,
      image: image ? { data: image.data, mimeType: image.mimeType } : undefined,
    });
  }

  return (
    <ToolLayout
      title="Code & error solver"
      description="Paste broken code, an error message, or a stack trace. Add a screenshot if that is easier. You get the root cause, fixed code, and why it works."
      input={
        <>
          <Field label="Code or error" hint={`${text.length.toLocaleString()} / ${MAX_PROMPT_CHARS.toLocaleString()}`}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
              onPaste={async (e) => {
                const file = imageFromClipboard(e);
                if (!file) return;
                e.preventDefault();
                setPasteError(null);
                try {
                  setImage(await fileToImage(file));
                } catch (err) {
                  setPasteError(err instanceof Error ? err.message : "Could not read that image.");
                }
              }}
              maxLength={MAX_PROMPT_CHARS}
              rows={14}
              spellCheck={false}
              placeholder={"TypeError: Cannot read properties of undefined (reading 'map')\n\nconst items = data.results.map(...)"}
              className={textareaClass + " font-mono text-[13px]"}
            />
          </Field>
          <Field label="Screenshot (optional)">
            <ImageUploader value={image} onChange={setImage} />
            {pasteError && <p role="alert" className="text-sm text-red-300">{pasteError}</p>}
          </Field>
          <div className="flex items-center gap-3">
            <PrimaryButton onClick={submit} disabled={!canSubmit} loading={loading}>
              <Wand2 className="h-4 w-4" aria-hidden />
              Solve
            </PrimaryButton>
            <span className="text-xs text-slate-500">Ctrl or ⌘ + Enter</span>
          </div>
        </>
      }
      output={
        <OutputPanel
          loading={loading}
          error={error}
          result={result}
          loadingLabel="Reading your code"
          emptyTitle="Your fix shows up here"
          emptyHint="You get a diagnosis, corrected code you can copy, and a short list of what changed."
        />
      }
    />
  );
}
