import type { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  input: ReactNode;
  output: ReactNode;
}

export function ToolLayout({ title, description, input, output }: Props) {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-8 md:py-8 lg:grid-cols-2 lg:gap-8">
      <header className="lg:col-span-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">{description}</p>
      </header>
      <div className="flex min-w-0 flex-col gap-4">{input}</div>
      <div className="min-w-0">{output}</div>
    </section>
  );
}
