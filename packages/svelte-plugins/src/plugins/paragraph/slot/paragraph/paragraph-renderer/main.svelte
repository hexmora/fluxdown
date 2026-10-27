<script lang="ts">
  import type { ParagraphProps } from '../../../../../base';

  let { Raw: _Raw, class: className, current: _current, parents: _parents, render: _render, children, ...props }: ParagraphProps = $props();
</script>

<p {...props} class={['fluxdown-svelte-paragraph-root', className]}>{@render children?.()}</p>

<style lang="scss">
  @use './index.scss';
</style>
