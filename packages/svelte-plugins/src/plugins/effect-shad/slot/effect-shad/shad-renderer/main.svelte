<script lang="ts">
  import type { ShadRendererProps } from './type';

  import { createAnimationDelay, resumeAnimation } from '../../../../../base';

  let { children, start, duration }: ShadRendererProps = $props();

  const getDelay = /*#__PURE__*/ createAnimationDelay();

  // Negative delay resumes the original fade when reparsing remounts an inline element, so
  // each character keeps its own clock instead of following the reveal position.
  const delay = $derived(getDelay(start));

  const active = $derived(start >= 0 && delay > -duration);
</script>

{#key start}
  <span
    class="fluxdown-svelte-effect-shad"
    class:active
    data-fluxdown-shad="fade"
    onanimationstart={(event) => resumeAnimation(event, start)}
    style={`--fluxdown-shad-duration: ${duration}ms; animation-delay: ${delay}ms`}
  >{@render children?.()}</span>
{/key}

<style lang="scss">
  @use './index.scss';
</style>
