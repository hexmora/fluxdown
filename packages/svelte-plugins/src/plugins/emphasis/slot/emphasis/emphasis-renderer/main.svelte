<script lang="ts">
  import type { EmphasisProps } from '../../../../../base';

  let { Raw: _Raw, class: className, current: _current, parents: _parents, render: _render, children, ...props }: EmphasisProps = $props();
</script>

<em {...props} class={['fluxdown-svelte-emphasis-root', className]}>{@render children?.()}</em>

<style lang="scss">
  @use './index.scss';
</style>
