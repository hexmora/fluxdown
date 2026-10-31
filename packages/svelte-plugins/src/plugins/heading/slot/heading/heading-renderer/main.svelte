<script lang="ts">
  import type { HeadingProps } from '../../../../../base';

  let { Raw: _Raw, class: className, current: _current, parents: _parents, render: _render, children, level, ...props }: HeadingProps = $props();

  const tagName = $derived(`h${Number.isInteger(level) && level >= 1 && level <= 6 ? level : 1}`);
</script>

<svelte:element this={tagName} {...props} class={['fluxdown-svelte-heading-root', className]}>{@render children?.()}</svelte:element>

<style lang="scss">
  @use './index.scss';
</style>
