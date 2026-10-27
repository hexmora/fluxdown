<script lang="ts">
  import type { StrongProps } from '../../../../../base';

  let { Raw: _Raw, class: className, current: _current, parents: _parents, render: _render, children, ...props }: StrongProps = $props();
</script>

<strong {...props} class={['fluxdown-svelte-strong-root', className]}>{@render children?.()}</strong>

<style lang="scss">
  @use './index.scss';
</style>
