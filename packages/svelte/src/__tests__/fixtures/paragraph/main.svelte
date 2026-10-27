<script lang="ts">
  import type { ParagraphProps } from '@fluxdown/svelte-plugins/base';

  let { Raw, ...props }: ParagraphProps = $props();
</script>

<section data-testid="custom-slot">
  {#if Raw}
    {@render Raw(props)}
  {:else}
    {@render props.children?.()}
  {/if}
</section>
