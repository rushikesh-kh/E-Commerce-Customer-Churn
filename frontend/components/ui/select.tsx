import { type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export function SelectField({ label, options, className, ...props }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-300">{label}</span>
      <span className="relative flex items-center">
        <select
          className={cn(
            "h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-900",
            "outline-none transition-all duration-200 focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 focus:shadow-sm",
            "dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-slate-600",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
      </span>
    </label>
  );
}
