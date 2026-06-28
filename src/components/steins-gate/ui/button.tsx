import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant: "primary" | "outlined";
  children: ReactNode;
  /** When provided the button renders as an `<a>`. Omit for a non-navigating element. */
  href?: string;
  /** Visually and functionally disables the button. */
  disabled?: boolean;
  leadingIcon?: IconType;
  trailingIcon?: IconType;
  iconStrokeWidth?: number;
  iconClassName?: string;
  external?: boolean;
  className?: string;
  onClick?: () => void;
}

const BASE =
  "inline-flex h-11 items-center justify-center gap-2 px-3 md:px-8 whitespace-nowrap outline-none transition-[transform,opacity,box-shadow,background-color] duration-200 shadow-button hover:shadow-button-glow focus-visible:shadow-button-glow active:shadow-button-glow";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground focus-visible:bg-accent active:bg-accent",
  outlined:
    "bg-background text-foreground border border-border focus-visible:bg-secondary active:bg-secondary",
} as const;

export function Button({
  variant,
  href,
  children,
  disabled,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  iconStrokeWidth,
  iconClassName,
  external,
  className,
  onClick,
}: ButtonProps) {
  const iconCls = iconClassName ?? "size-4";

  const content = (
    <>
      {LeadingIcon && (
        <LeadingIcon className={iconCls} strokeWidth={iconStrokeWidth} aria-hidden="true" />
      )}
      <span>{children}</span>
      {TrailingIcon && (
        <TrailingIcon className={iconCls} strokeWidth={iconStrokeWidth} aria-hidden="true" />
      )}
    </>
  );

  if (disabled || !href) {
    return (
      <span
        role="button"
        aria-disabled="true"
        className={cn(BASE, VARIANTS[variant], "pointer-events-none opacity-50", className)}
      >
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(BASE, VARIANTS[variant], className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}
