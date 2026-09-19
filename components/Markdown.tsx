import { CodeBlock } from "./CodeBlock";
import { splitMarkdown } from "@/lib/markdown";

type Block =
  | { kind: "h"; level: number; text: string }
  | { kind: "p"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] };

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let prevBlank = true;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      prevBlank = true;
      continue;
    }
    const last = blocks[blocks.length - 1];
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);

    if (heading) {
      blocks.push({ kind: "h", level: heading[1].length, text: heading[2] });
    } else if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const item = (bullet ?? numbered)![1];
      if (last?.kind === "list" && last.ordered === ordered) last.items.push(item);
      else blocks.push({ kind: "list", ordered, items: [item] });
    } else if (last?.kind === "p" && !prevBlank) {
      last.text += " " + line;
    } else {
      blocks.push({ kind: "p", text: line });
    }
    prevBlank = false;
  }
  return blocks;
}

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
        if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[0.85em] text-indigo-200">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-slate-50">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function Prose({ text }: { text: string }) {
  return (
    <>
      {parseBlocks(text).map((b, i) => {
        if (b.kind === "h") {
          return (
            <h3 key={i} className={"font-semibold text-slate-50 " + (b.level <= 2 ? "mt-2 text-base" : "text-sm")}>
              <Inline text={b.text} />
            </h3>
          );
        }
        if (b.kind === "list") {
          const Tag = b.ordered ? "ol" : "ul";
          return (
            <Tag key={i} className={"space-y-1.5 pl-5 text-slate-300 marker:text-slate-500 " + (b.ordered ? "list-decimal" : "list-disc")}>
              {b.items.map((item, j) => (
                <li key={j} className="pl-1 leading-relaxed">
                  <Inline text={item} />
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={i} className="leading-relaxed text-slate-300">
            <Inline text={b.text} />
          </p>
        );
      })}
    </>
  );
}

 
export function Markdown({ source }: { source: string }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      {splitMarkdown(source).map((seg, i) =>
        seg.type === "code" ? <CodeBlock key={i} code={seg.code} language={seg.lang} /> : <Prose key={i} text={seg.text} />,
      )}
    </div>
  );
}
