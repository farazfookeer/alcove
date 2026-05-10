import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", disabled, className = "", children, ...props }: ButtonProps) {
  if (variant === "secondary") {
    return (
      <button
        className={`px-6 py-3 bg-transparent text-alcove-text-muted border border-alcove-border-hover rounded-lg text-[13px] cursor-pointer font-mono transition-all duration-300 hover:border-alcove-text-muted ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      disabled={disabled}
      className={`px-8 py-3 border-none rounded-lg text-sm font-bold tracking-wide cursor-pointer font-mono uppercase transition-all duration-300 ${
        disabled
          ? "bg-alcove-border text-alcove-text-disabled cursor-not-allowed"
          : "text-alcove-bg hover:brightness-110"
      } ${className}`}
      style={
        disabled
          ? undefined
          : { background: "linear-gradient(135deg, #F59E0B, #D97706)" }
      }
      {...props}
    >
      {children}
    </button>
  );
}
