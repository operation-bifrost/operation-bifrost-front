<script lang="ts">
  import Icon from "@iconify/svelte";

  interface Props {
    icon: string;
    link: string;
  }

  let { icon, link }: Props = $props();

  let isLoaded = $state(false);

  function handleLoad() {
    isLoaded = true;
  }
</script>

<a
  href={link}
  target="_blank"
  aria-label={icon}
  class={`flex items-center justify-center p-2 rounded-full transition-all duration-300 ease-in-out relative h-11 w-11 ${!isLoaded ? "pointer-events-none cursor-default" : "hover:scale-110 hover:bg-white/20 hover:backdrop-blur-sm"}`}
>
  {#if !isLoaded}
    <div class="absolute inset-0 bg-white/10 animate-pulse rounded-full"></div>
  {/if}

  <Icon
    {icon}
    on:load={handleLoad}
    class={`transition-opacity duration-300 ease-in-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
  />
</a>
