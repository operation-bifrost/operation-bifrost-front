import { NavMenuLink } from "@/components/steins-gate/navbar/nav-menu-link";
import { steinsGateContent } from "@/data/steins-gate";
import { cn } from "@/lib/utils";

interface NavbarMenuProps {
  orientation?: "horizontal" | "vertical";
}

export function NavbarMenu({ orientation = "horizontal" }: NavbarMenuProps = {}) {
  const { navItems } = steinsGateContent.navbar;

  return (
    <ul
      className={cn(
        "flex gap-2",
        orientation === "horizontal" ? "items-center" : "flex-col items-stretch",
      )}
    >
      {navItems.map((item) => (
        <li key={item.label}>
          <NavMenuLink label={item.label} href={item.href} />
        </li>
      ))}
    </ul>
  );
}
