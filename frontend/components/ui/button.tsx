import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/30 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        gradient: "bg-brand-gradient text-white shadow-sm hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:opacity-60 disabled:hover:shadow-sm",
        ghost: "bg-transparent text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white active:translate-y-0 disabled:hover:translate-y-0",
      },
      size: {
        default: "h-11 px-5 text-sm",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "gradient", size: "default" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
