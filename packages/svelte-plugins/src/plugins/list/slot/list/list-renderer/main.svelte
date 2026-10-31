<script lang="ts">
  import type { ListProps } from '../../../../../base';

  let { Raw: _Raw, class: className, current: _current, parents: _parents, render: _render, children, type, ...props }: ListProps = $props();

  const tagName = $derived(type === 'ordered' ? 'ol' : 'ul');
</script>

<svelte:element this={tagName} {...props} class={['fluxdown-svelte-list-root', className]}>{@render children?.()}</svelte:element>

<style lang="scss">
  @use './index.scss';
</style>
