import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom does not implement ResizeObserver, but Recharts' ResponsiveContainer
// (used by shadcn's ChartContainer) requires it to mount.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverStub);

// Recharts measures the container element to size its SVG. jsdom reports 0x0
// for all elements, which makes ResponsiveContainer warn
// ("width(0) and height(0) ... should be greater than 0") and skip rendering
// children. Give elements a non-zero size so charts actually mount in tests.
// Guarded because some suites run under `@vitest-environment node`, where
// `HTMLElement` does not exist.
if (typeof HTMLElement !== "undefined") {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: 600,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: 300,
  });
  HTMLElement.prototype.getBoundingClientRect = () =>
    ({
      width: 600,
      height: 300,
      top: 0,
      left: 0,
      right: 600,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON() {
        return this;
      },
    }) as DOMRect;
}
