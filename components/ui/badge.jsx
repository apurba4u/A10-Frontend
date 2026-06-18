import { cn } from "../../lib/utils";

const variants = {
  default: "bg-slate-100 text-slate-800",
  secondary: "bg-slate-100 text-slate-600",
  destructive: "bg-red-100 text-red-800",
  outline: "border border-slate-200 text-slate-600",
  success: "bg-green-100 text-green-800",
};

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
