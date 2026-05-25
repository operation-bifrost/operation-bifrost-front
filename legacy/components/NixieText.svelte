<script lang="ts">
  interface Props {
    text: string;
    withTyping?: boolean;
  }

  let { text, withTyping = false }: Props = $props();
</script>

<div class="grid text-center select-none cursor-default">
  <span
    class="font-bonx-frame opacity-40 frame break-words whitespace-normal col-start-1 row-start-1"
  >
    {#if withTyping}
      <span>{text}</span><span class="invisible">_</span>
    {:else}
      {text}
    {/if}
  </span>
  <span
    class="font-bonx-sihouette opacity-40 sihouette break-words whitespace-normal col-start-1 row-start-1"
  >
    {#if withTyping}
      <span>{text}</span><span class="invisible">_</span>
    {:else}
      {text}
    {/if}
  </span>
  <span
    class="font-bonx title break-words whitespace-normal col-start-1 row-start-1"
  >
    {#if withTyping}
      <span>{text}</span><span class="font-iosevka typing">_</span>
    {:else}
      {text}
    {/if}
  </span>
</div>
