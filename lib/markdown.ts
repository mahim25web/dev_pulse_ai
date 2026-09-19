export type Segment =
  | { type: "text"; text: string }
  | { type: "code"; lang: string; code: string };

/** Splits Markdown into prose and fenced code segments. Handles an unterminated final fence. */
export function splitMarkdown(md: string): Segment[] {
  const segments: Segment[] = [];
  const fence = /```([\w+#.-]*)[^\n]*\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = fence.exec(md))) {
    if (m.index > last) segments.push({ type: "text", text: md.slice(last, m.index) });
    segments.push({ type: "code", lang: m[1], code: m[2].replace(/\n$/, "") });
    last = m.index + m[0].length;
  }

  const tail = md.slice(last);
  const open = tail.indexOf("```");
  if (open === -1) {
    if (tail.trim()) segments.push({ type: "text", text: tail });
  } else {
    if (tail.slice(0, open).trim()) segments.push({ type: "text", text: tail.slice(0, open) });
    const after = tail.slice(open + 3);
    const nl = after.indexOf("\n");
    segments.push({
      type: "code",
      lang: (nl === -1 ? after : after.slice(0, nl)).trim(),
      code: nl === -1 ? "" : after.slice(nl + 1).replace(/\n$/, ""),
    });
  }
  return segments;
}

/** Pulls the first code block (preferring `lang`) out of a response; returns the remaining Markdown. */
export function extractCodeBlock(md: string, preferredLang: string) {
  const segments = splitMarkdown(md);
  const codes = segments.filter((s): s is Extract<Segment, { type: "code" }> => s.type === "code");
  const chosen = codes.find((c) => c.lang.toLowerCase() === preferredLang) ?? codes[0];
  if (!chosen) return null;

  const rest = segments
    .filter((s) => s !== chosen)
    .map((s) => (s.type === "text" ? s.text : "```" + s.lang + "\n" + s.code + "\n```"))
    .join("\n")
    .trim();

  return { code: chosen.code, lang: chosen.lang, rest };
}
