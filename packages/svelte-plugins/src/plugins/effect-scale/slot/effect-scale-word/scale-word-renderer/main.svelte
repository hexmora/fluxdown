<script lang="ts">
  import type { ScaleWordRendererProps } from './type';

  let { children }: ScaleWordRendererProps = $props();
</script>

<span class="fluxdown-svelte-effect-scale-word">{@render children?.()}</span>

<style lang="scss">
  @use './index.scss';
</style>
