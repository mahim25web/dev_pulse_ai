import { Bug, FileText, Languages, LayoutTemplate, type LucideIcon } from "lucide-react";
import type { ToolId } from "./types";

export interface ToolMeta {
  id: ToolId;
  label: string;
  short: string;
  hint: string;
  icon: LucideIcon;
}

export const TOOLS: ToolMeta[] = [
  { id: "solver", label: "Code & error solver", short: "Solver", hint: "Fix bugs from code or a screenshot", icon: Bug },
  { id: "ui", label: "UI generator", short: "UI", hint: "HTML + Tailwind with live preview", icon: LayoutTemplate },
  { id: "summarizer", label: "Article summarizer", short: "Summary", hint: "Key takeaways in seconds", icon: FileText },
  { id: "translator", label: "Translate & post", short: "Translate", hint: "English, Bengali, social posts", icon: Languages },
];
