import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const variants = {
  default:
    "bg-slate-900 text-white hover:bg-slate-800 shadow-xs",
  destructive:
    "bg-red-600 text-white hover:bg-red-500 shadow-xs",
  outline:
    "border border-slate-200 bg-white hover:bg-slate-100",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "hover:bg-slate-100",
  link: "text-slate-900 underline-offset-4 hover:underline",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

const Button = forwardRef(function Button(
  { className, variant = "default", size = "default", ...props },
  ref
) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

export { Button };
