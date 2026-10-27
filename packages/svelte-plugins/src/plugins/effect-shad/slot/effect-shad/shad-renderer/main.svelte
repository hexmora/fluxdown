<script lang="ts">
  import type { ShadRendererProps } from './type';

  import { NodeRenderer } from '../../../../../base';

  let { active, isActive, leading, maskWidth }: ShadRendererProps = $props();
</script>

<span class="fluxdown-svelte-effect-shad"
  ><span class="leading"><NodeRenderer node={leading} /></span><span class="active"
    ><NodeRenderer node={active} /></span
  ><span
    aria-hidden="true"
    class={isActive ? 'mask' : 'mask-hidden'}
    style={`width: ${maskWidth}px; margin-left: ${-maskWidth}px`}
  ></span></span
>

<style lang="scss">
  @use './index.scss';
</style>
