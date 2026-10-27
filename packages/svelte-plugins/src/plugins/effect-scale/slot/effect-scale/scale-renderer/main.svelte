<script lang="ts">
  import type { ScaleRendererProps } from './type';

  import { createAnimationDelay, resumeAnimation } from '../../../../../base';

  let { children, start, duration, from, blur }: ScaleRendererProps = $props();

  const getDelay = /*#__PURE__*/ createAnimationDelay();

  const delay = $derived(getDelay(start));

  const active = $derived(start >= 0 && delay > -duration);
</script>

{#key start}
  <span
    class="fluxdown-svelte-effect-scale"
    class:active
    onanimationstart={(event) => resumeAnimation(event, start)}
    style={`--fluxdown-scale-duration: ${duration}ms; --fluxdown-scale-from: ${from}; --fluxdown-scale-blur: ${blur}em; animation-delay: ${delay}ms`}
  ><span class="glyph">{@render children?.()}</span></span>
{/key}

<style lang="scss">
  @use './index.scss';
</style>
