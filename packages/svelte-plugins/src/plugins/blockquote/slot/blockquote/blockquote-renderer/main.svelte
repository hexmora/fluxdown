<script lang="ts">
  import type { BlockquoteProps } from '../../../../../base';

  let { Raw: _Raw, class: className, current: _current, parents: _parents, render: _render, children, ...props }: BlockquoteProps = $props();
</script>

<blockquote {...props} class={['fluxdown-svelte-blockquote-root', className]}>{@render children?.()}</blockquote>

<style lang="scss">
  @use './index.scss';
</style>
