import { clsx, type ClassValue } from "clsx";
import { createElement, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Matches markdown-style inline links: [label](https://url)
const INLINE_LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

/**
 * Renders text that may contain markdown-style `[label](url)` links, turning
 * each into a clickable, theme-styled anchor while leaving the surrounding
 * prose untouched. The visible text is the `label`, so source strings read
 * naturally (e.g. `...ได้ที่[ลิงก์นี้](https://...)`).
 */
export function renderTextWithLinks(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  // Reset because the pattern is a shared, stateful global regex.
  INLINE_LINK_PATTERN.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = INLINE_LINK_PATTERN.exec(text)) !== null) {
    const [matched, label, href] = match;

    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    nodes.push(
      createElement(
        "a",
        {
          key: match.index,
          href,
          target: "_blank",
          rel: "noopener noreferrer",
          className:
            "text-primary hover:text-accent underline underline-offset-4 transition-colors",
        },
        label,
      ),
    );

    lastIndex = match.index + matched.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
