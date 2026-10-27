<script lang="ts">
  import type { BreakLineProps } from '../../../../../base';

  let { Raw: _Raw, class: className, ...props }: BreakLineProps = $props();
</script>

<br {...props} class={['fluxdown-svelte-break-line-root', className]} />

<style lang="scss">
  @use './index.scss';
</style>
