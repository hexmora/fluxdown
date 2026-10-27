<script lang="ts">
  import type { TexProps } from '../../../../../base';

  let { Raw: _Raw, class: className, current: _current, parents: _parents, render: _render, mode = 'inline', tex, ...props }: TexProps = $props();

  const tagName = $derived(mode === 'display' ? 'div' : 'span');
</script>

<svelte:element this={tagName} {...props} class={['fluxdown-svelte-tex-root', className]} data-mode={mode}>{tex}</svelte:element>

<style lang="scss">
  @use './index.scss';
</style>
