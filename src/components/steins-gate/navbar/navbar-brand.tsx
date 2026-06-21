import { BifrostWordmark } from "@/components/steins-gate/ui/bifrost-wordmark";
import { steinsGateContent } from "@/data/steins-gate";

export function NavbarBrand() {
  const { brand } = steinsGateContent.navbar;

  return (
    <a href="/" aria-label="Operation Bifrost — back to top" className="flex items-center gap-4">
      <img
        src={brand.logoSrc}
        alt=""
        aria-hidden="true"
        width={52}
        height={52}
        className="size-13"
        loading="eager"
      />
      <span aria-hidden="true" className="translate-y-1">
        <BifrostWordmark size={24} />
      </span>
    </a>
  );
}
