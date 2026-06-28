import { GearPair } from "@/components/steins-gate/decor/gear";

/**
 * Clockwork decor for the Download section — the final section on the page.
 *
 * Composition is a deliberate diagonal that answers what's already on-screen
 * rather than copying the Gallery's corners:
 *  - Gallery already bleeds a meshing pair down into Download's *top-right*, so
 *    Download adds its own pair at the *top-left* as a counterweight.
 *  - Download is the terminal section, so a larger pair sinks off the
 *    *bottom-right* past the page end, letting the page "wind down".
 *
 * Gears live at `-z-10` in the gutters/seams; content cards sit above them with
 * their own backdrop blur, so the motif never fights the CTA or screenshots.
 */
export function DownloadDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* Top-left meshing pair — counterweights the gear pair Gallery bleeds into
          Download's top-right. Large gear sits off the upper-left edge, small
          gear down-right so the mesh contact stays on-screen. lg only. */}
      <GearPair
        className="top-80 left-4 hidden text-[13px] lg:block"
        teethLarge={17}
        teethSmall={12}
        angleDeg={28}
        spinLarge="forward"
        largeClassName="text-secondary/30"
        smallClassName="text-secondary/40"
      />

      {/* Bottom-right meshing pair — the page's terminal flourish: a large gear
          sinks off the bottom-right past the page end, small gear up-left to keep
          the mesh contact on-screen. md+. */}
      <GearPair
        className="right-80 bottom-20 text-[12px] md:text-[15px]"
        teethLarge={17}
        teethSmall={12}
        angleDeg={205}
        spinLarge="reverse"
        largeClassName="text-secondary/30"
        smallClassName="text-secondary/40"
      />
    </div>
  );
}
