"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      {typeof children === "function"
        ? children({ open, setOpen })
        : children}
    </div>
  );
}

function DropdownMenuTrigger({ asChild, children, ...props }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({ className, align = "end", children, ...props }) {
  return (
    <div
      className={cn(
        "absolute right-0 z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        align === "end" && "right-0",
        align === "start" && "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({ className, onClick, children, ...props }) {
  return (
    <button
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
