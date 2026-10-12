import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full border border-transparent",
          "font-medium cursor-pointer transition-all duration-[220ms]",
          "font-sans",
          {
            "text-[13px] px-4 py-[10px]": size === "md",
            "text-[13px] px-3 py-2": size === "sm",
            "text-[14px] px-[22px] py-[14px]": size === "lg",
          },
          {
            "bg-ink text-paper shadow-1 hover:bg-black hover:-translate-y-px hover:shadow-2 active:scale-[0.97]":
              variant === "primary",
            "bg-surface text-ink border-line-2 hover:border-ink hover:-translate-y-px":
              variant === "secondary",
            "bg-transparent text-ink-2 hover:text-ink": variant === "ghost",
            "text-white hover:-translate-y-px active:scale-[0.97]": variant === "accent",
          },
          className
        )}
        style={
          variant === "accent"
            ? {
                background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
                boxShadow: "0 10px 24px -8px rgba(6,182,212,0.5)",
              }
            : undefined
        }
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
