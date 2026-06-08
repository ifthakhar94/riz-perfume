import { cn } from "@/lib/utils";

/** Riz Perfume wordmark used in the dashboard sidebar / login. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-serif text-lg font-bold text-primary-foreground">
        R
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-base font-bold tracking-wide">RIZ PERFUME</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Admin</span>
      </span>
    </div>
  );
}
