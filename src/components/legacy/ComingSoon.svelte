<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { type GetProgressResponse } from "../../type";

  import NixieText from "@/components/NixieText.svelte";
  import IconLink from "@/components/IconLink.svelte";

  let overallProgress: number;
  let translateProgress = $state(0);
  let approveProgress = $state(0);

  let meter = $state("0.000000%");
  let animationInterval: number;
  let periodicInterval: number;
  let randomPhrase = $state("");
  let showTooltip = $state(false);
  let tooltipLocked = false;

  const ANIMATION_DURATION = 4000; // duration in milliseconds
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  const REPLAY_INTERVAL = 10 * 60 * 1000; // 10 minutes

  const phrases = [
    "Opening the Gate",
    "Hacking to the Gate",
    "Calculating World Lines",
    "Synchronizing Timeline",
    "Gathering Divergence Data",
    "Processing Future Data",
  ];

  function getRandomPhrase() {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  async function fetchData() {
    const cachedData = localStorage.getItem("progressData");
    const cachedTime = localStorage.getItem("progressTime");
    const now = Date.now();

    if (
      cachedData &&
      cachedTime &&
      now - parseInt(cachedTime) < CACHE_DURATION
    ) {
      const data: GetProgressResponse = JSON.parse(cachedData);
      translateProgress = data.translateProgress;
      approveProgress = data.approveProgress;
      overallProgress =
        (data.translateProgress + data.approveProgress) / 2 / 100;
    } else {
      const response = await fetch("/api/progress");

      if (!response.ok) {
        console.error("Failed to fetch data");
        overallProgress = 0; // Set to 0 on failure to avoid infinite loop
        return;
      }

      const data: GetProgressResponse = await response.json();
      translateProgress = data.translateProgress;
      approveProgress = data.approveProgress;
      overallProgress =
        (data.translateProgress + data.approveProgress) / 2 / 100;
      localStorage.setItem("progressData", JSON.stringify(data));
      localStorage.setItem("progressTime", now.toString());
    }

    if (overallProgress === 1) {
      overallProgress = 1.048596; // Steins;Gate World Line
    }
  }

  async function startAnimation() {
    // Fetch new data before starting animation
    await fetchData();
    randomPhrase =
      overallProgress === 1.048596 ? "Reached Steins;Gate" : getRandomPhrase();

    // Clear any existing animation
    if (animationInterval) {
      clearInterval(animationInterval);
    }

    const totalDigits = 6;
    const timePerDigit = ANIMATION_DURATION / totalDigits;
    const startTime = Date.now();

    animationInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const revealedDigits = Math.floor(elapsedTime / timePerDigit);

      if (revealedDigits < totalDigits) {
        meter = buildMeterDisplay(overallProgress, revealedDigits);
      } else {
        meter = overallProgress.toFixed(6) + "%";
        clearInterval(animationInterval);
      }
    }, 50);
  }

  onMount(() => {
    startAnimation();
    // Start periodic animation
    periodicInterval = setInterval(() => {
      startAnimation();
    }, REPLAY_INTERVAL);

    return () => {
      clearInterval(animationInterval);
      clearInterval(periodicInterval);
    };
  });

  function getRandomDigit(): number {
    return Math.floor(Math.random() * 10);
  }

  function buildMeterDisplay(
    finalNumber: number,
    revealedDigits: number
  ): string {
    const finalStr = finalNumber.toFixed(6);
    let result = finalNumber > 1 ? "1." : "0.";

    // Start from first decimal digit (position 2 in string)
    for (let i = 2; i < 8; i++) {
      // Shifted condition to treat first digit as not revealed initially
      if (i - 2 < revealedDigits) {
        result += finalStr[i];
      } else {
        result += getRandomDigit();
      }
    }

    return result + "%";
  }

  function toggleTooltip(e: Event) {
    e.stopPropagation();
    tooltipLocked = !tooltipLocked;
    showTooltip = tooltipLocked;
  }

  function showTooltipHover(e: PointerEvent) {
    // Only show on hover if not locked and pointer is a mouse
    if (!tooltipLocked && e.pointerType === "mouse") showTooltip = true;
  }

  function hideTooltipHover(e: PointerEvent) {
    // Only hide on hover out if not locked and pointer is a mouse
    if (!tooltipLocked && e.pointerType === "mouse") showTooltip = false;
  }

  function hideTooltip() {
    tooltipLocked = false;
    showTooltip = false;
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="flex flex-col gap-4 h-dvh justify-center items-center text-center bg-stone-950 p-4"
  onclick={startAnimation}
  role="button"
  tabindex="0"
>
  <div class="relative">
    <div
      class="flex items-center text-5xl md:text-6xl lg:text-8xl text-slate-50"
    >
      <NixieText text={meter} />
    </div>
    <div
      class="absolute top-0 right-0 group"
      tabindex="0"
      onpointerenter={showTooltipHover}
      onpointerleave={hideTooltipHover}
      onclick={(e) => {
        e.stopPropagation();
        toggleTooltip(e);
      }}
      onblur={hideTooltip}
    >
      <Icon
        icon="lucide:info"
        class="h-5 glow-all translate-x-4 cursor-pointer"
        aria-label="Show progress info"
      />
      <div
        class="absolute -translate-y-3/4 font-ibm transition duration-300 bg-stone-800 border border-stone-600 rounded-lg p-3 min-w-[170px] text-left text-sm z-10 -translate-x-full md:translate-x-10"
        class:opacity-0={!showTooltip}
        class:pointer-events-none={!showTooltip}
        class:opacity-100={showTooltip}
        class:pointer-events-auto={showTooltip}
        onclick={(e) => e.stopPropagation()}
      >
        <div class="mb-2 flex justify-between">
          <span class="text-stone-400">แปลแล้ว:</span>
          <span class="text-stone-200">{translateProgress}%</span>
        </div>
        <div class="flex justify-between">
          <span class="text-stone-400">ตรวจแล้ว:</span>
          <span class="text-stone-200">{approveProgress}%</span>
        </div>
      </div>
    </div>
  </div>
  <div class={`text-4xl ${randomPhrase ? "" : "invisible"}`}>
    <NixieText text={randomPhrase} withTyping />
  </div>
</div>

<footer
  class="flex gap-1 text-3xl border justify-center items-center z-50 fixed bottom-5 py-2 px-4 left-1/2 transform -translate-x-1/2 rounded-4xl glow-all"
>
  <IconLink icon="ic:baseline-discord" link="https://discord.gg/8WHxqbCjGD" />
  <IconLink
    icon="ic:baseline-facebook"
    link="https://www.facebook.com/learningtranslator"
  />
  <IconLink
    icon="mdi:youtube"
    link="https://www.youtube.com/@operationbifrost"
  />
</footer>
