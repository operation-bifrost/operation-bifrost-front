import type { IconType } from "react-icons";

export interface NavItem {
  label: string;
  href: string;
}

export type SocialBrand = "facebook" | "discord" | "youtube";

export interface SocialLink {
  label: string;
  href: string;
  brand: SocialBrand;
  icon: IconType;
}

export interface CtaConfig {
  label: string;
  href: string;
}

export interface GalleryVideo {
  id: string;
  title: string;
  channel?: string;
  duration?: string;
}

export interface GalleryPhoto {
  src: string;
  alt: string;
}

export interface InstallStep {
  number: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CreditSocial {
  label: string;
  href: string;
  icon: IconType;
}

export interface CreditPerson {
  name: string;
  role?: string;
  socials?: ReadonlyArray<CreditSocial>;
}
