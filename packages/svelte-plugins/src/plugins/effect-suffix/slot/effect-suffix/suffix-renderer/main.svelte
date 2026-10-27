<script lang="ts">
  import type { SuffixRendererProps } from './type';

  let { children, type }: SuffixRendererProps = $props();

  const marker = $derived(type === 'cursor' || type === 'dot' ? type : 'custom');
</script>

<span aria-hidden="true" class="fluxdown-svelte-effect-suffix" data-fluxdown-suffix={type}
  ><span class={`marker ${marker}`}>{@render children?.()}</span></span
>

<style lang="scss">
  @use './index.scss';
</style>
