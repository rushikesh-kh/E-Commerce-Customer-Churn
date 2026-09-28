import { type InputHTMLAttributes } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  hint?: string;
}

export function Field({
  label,
  icon: Icon,
  hint,
  className,
  ...props
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-300">
        {label}
      </span>

      <span className="relative flex items-center">
        <input
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 pr-10 text-sm leading-none text-slate-900",
            "outline-none transition-all duration-200 hover:border-slate-300 focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 focus:shadow-sm focus:-translate-y-px",
            "dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-slate-600",
            className
          )}
          {...props}
        />

        <Icon className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
      </span>

      {hint && (
        <span className="mt-1.5 block pl-0.5 text-[11px] font-medium tracking-[0.01em] text-slate-400/80 dark:text-slate-500/90">
          <span className="text-slate-400/60 dark:text-slate-500/70">
            Suggested range
          </span>

          <span className="mx-1 text-slate-300/70 dark:text-slate-600">
            ·
          </span>

          <span className="text-slate-500/80 dark:text-slate-400/80">
            {hint}
          </span>
        </span>
      )}
    </label>
  );
}
