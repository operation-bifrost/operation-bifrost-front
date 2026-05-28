import { cn } from "@/lib/utils";

interface NavMenuLinkProps {
  label: string;
  href: string;
  className?: string;
  isActive?: boolean;
}

export function NavMenuLink({
  label,
  href,
  className,
  isActive = false,
}: NavMenuLinkProps) {
  return (
    <a
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "nav-link inline-flex h-10 items-center whitespace-nowrap rounded-md px-4 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "is-active",
        className,
      )}
    >
      {label}
    </a>
  );
}
