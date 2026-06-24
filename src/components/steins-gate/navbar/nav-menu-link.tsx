import { cn } from "@/lib/utils";

interface NavMenuLinkProps {
  label: string;
  href: string;
  className?: string;
  isActive?: boolean;
}

export function NavMenuLink({ label, href, className, isActive = false }: NavMenuLinkProps) {
  return (
    <a
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "nav-link text-foreground focus-visible:ring-ring inline-flex h-10 items-center rounded-md px-4 whitespace-nowrap focus-visible:ring-2 focus-visible:outline-none",
        isActive && "is-active",
        className,
      )}
    >
      {label}
    </a>
  );
}
