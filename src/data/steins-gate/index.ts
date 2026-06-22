import { credits } from "./credits";
import { donate } from "./donate";
import { download } from "./download";
import { faq } from "./faq";
import { features } from "./features";
import { gallery } from "./gallery";
import { hero } from "./hero";
import { navbar } from "./navbar";

export * from "./types";

export const steinsGateContent = {
  navbar,
  hero,
  features,
  gallery,
  download,
  faq,
  credits,
  donate,
} as const;

export type SteinsGateContent = typeof steinsGateContent;
export type FeatureItem = (typeof steinsGateContent.features.items)[number] & {
  terminalLabel?: string;
};
