<script lang="ts">
  import type { ChunkRendererProps } from './type';

  import { createAnimationDelay, resumeAnimation } from '../../../../../base';

  let { children, start, duration }: ChunkRendererProps = $props();

  const getDelay = /*#__PURE__*/ createAnimationDelay();

  // Only a new batch changes the delay; other prop updates keep the animation in flight.
  const delay = $derived(getDelay(start));

  const active = $derived(start >= 0 && delay > -duration);
</script>

{#key start}
  <span
    class="fluxdown-svelte-effect-chunk"
    class:active
    data-fluxdown-chunk="1"
    onanimationstart={(event) => resumeAnimation(event, start)}
    style={`--fluxdown-chunk-duration: ${duration}ms; animation-delay: ${delay}ms`}
  >{@render children?.()}</span>
{/key}

<style lang="scss">
  @use './index.scss';
</style>
