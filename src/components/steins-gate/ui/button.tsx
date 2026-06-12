import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant: "primary" | "outlined";
  href: string;
  children: ReactNode;
  leadingIcon?: IconType;
  trailingIcon?: IconType;
  iconStrokeWidth?: number;
  iconClassName?: string;
  external?: boolean;
  className?: string;
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
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  iconStrokeWidth,
  iconClassName,
  external,
  className,
}: ButtonProps) {
  const iconCls = iconClassName ?? "size-4";
  return (
    <a
      href={href}
      className={cn(BASE, VARIANTS[variant], className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {LeadingIcon && (
        <LeadingIcon className={iconCls} strokeWidth={iconStrokeWidth} aria-hidden="true" />
      )}
      <span>{children}</span>
      {TrailingIcon && (
        <TrailingIcon className={iconCls} strokeWidth={iconStrokeWidth} aria-hidden="true" />
      )}
    </a>
  );
}
