"use client";

import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { Markdown } from "./Markdown";
import { PulseLoader } from "./PulseLoader";

interface Props {
  loading: boolean;
  error: string | null;
  result: string;
  emptyTitle: string;
  emptyHint: string;
  loadingLabel?: string;
  
  children?: ReactNode;
}

export function OutputPanel({ loading, error, result, emptyTitle, emptyHint, loadingLabel, children }: Props) {
  return (
    <div className="min-h-96 rounded-xl border border-slate-800 bg-slate-900/40 p-4 md:p-5" aria-live="polite" aria-busy={loading}>
      {loading ? (
        <PulseLoader label={loadingLabel} />
      ) : error ? (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      ) : result ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {children ?? <Markdown source={result} />}
        </motion.div>
      ) : (
        <div className="flex h-full min-h-80 flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-300">{emptyTitle}</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">{emptyHint}</p>
        </div>
      )}
    </div>
  );
}