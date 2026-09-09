import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <p className="text-lg font-semibold tracking-tight">AI Demo</p>
        <ThemeToggle />
      </div>
    </header>
  );
}
