"use client";

import { Activity } from "lucide-react";
import { motion } from "framer-motion";

import { TOOLS } from "@/lib/tools";
import type { ToolId } from "@/lib/types";

interface Props {
  active: ToolId;
  onChange: (id: ToolId) => void;
}

export function Sidebar({ active, onChange }: Props) {
  return (
    <>
      {}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-800 bg-slate-950 md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Activity className="h-5 w-5 text-indigo-400" aria-hidden />
          <span className="text-base font-semibold tracking-tight text-slate-50">DevPulse AI</span>
        </div>

        <nav aria-label="Tools" className="flex flex-1 flex-col gap-1 px-3">
          {TOOLS.map(({ id, label, hint, icon: Icon }) => {
            const isActive = id === active;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? "page" : undefined}
                className="relative rounded-lg px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-indigo-400"
              >
                {isActive && (
                  <motion.span
                    layoutId="active-tool"
                    className="absolute inset-0 rounded-lg bg-slate-800/80"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative flex items-start gap-3">
                  <Icon className={"mt-0.5 h-4 w-4 shrink-0 " + (isActive ? "text-indigo-400" : "text-slate-500")} aria-hidden />
                  <span>
                    <span className={"block text-sm font-medium " + (isActive ? "text-slate-50" : "text-slate-300")}>{label}</span>
                    <span className="block text-xs text-slate-500">{hint}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <p className="px-5 py-4 text-xs text-slate-600">Runs on Gemini 2.5 Flash</p>
      </aside>

      {/* Mobile: bottom tab bar */}
      <nav
        aria-label="Tools"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-slate-800 bg-slate-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {TOOLS.map(({ id, short, icon: Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? "page" : undefined}
              className={
                "flex flex-col items-center gap-1 py-2.5 text-xs focus-visible:outline-2 focus-visible:outline-indigo-400 " +
                (isActive ? "text-indigo-300" : "text-slate-500")
              }
            >
              <Icon className="h-5 w-5" aria-hidden />
              {short}
            </button>
          );
        })}
      </nav>
    </>
  );
}
