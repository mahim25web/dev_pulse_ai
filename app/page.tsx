"use client";

import { useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import { CodeSolver } from "@/components/tools/CodeSolver";
import { Summarizer } from "@/components/tools/Summarizer";
import { Translator } from "@/components/tools/Translator";
import { UIGenerator } from "@/components/tools/UIGenerator";
import type { ToolId } from "@/lib/types";

export default function Home() {
  const [active, setActive] = useState<ToolId>("solver");

  return (
    <div className="min-h-dvh md:pl-64">
      <Sidebar active={active} onChange={setActive} />
      {/* All tools stay mounted so input and results survive tab switches. */}
      <main className="pb-24 md:pb-8">
        <div hidden={active !== "solver"}><CodeSolver /></div>
        <div hidden={active !== "ui"}><UIGenerator /></div>
        <div hidden={active !== "summarizer"}><Summarizer /></div>
        <div hidden={active !== "translator"}><Translator /></div>
      </main>
    </div>
  );
}
