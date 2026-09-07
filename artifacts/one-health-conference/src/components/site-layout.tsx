import { Link } from "wouter";
import type { ReactNode } from "react";

export function SiteLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
    <main className="mx-auto max-w-[1250px] px-5 pb-24 pt-28 sm:px-8 lg:px-12">
      <Link href="/" className="text-sm font-bold text-teal-700">← Home</Link>
      <h1 className="mt-6 font-display text-5xl sm:text-6xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">{subtitle}</p>}
      <div className="mt-10">{children}</div>
    </main>
  </div>;
}
