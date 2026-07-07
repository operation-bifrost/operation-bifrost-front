import { BifrostLockup } from "@/components/steins-gate/ui/bifrost-lockup";

export function NavbarBrand() {
  return (
    <a href="#" aria-label="Operation Bifrost — back to top" className="flex items-center">
      <BifrostLockup className="h-12" />
    </a>
  );
}
