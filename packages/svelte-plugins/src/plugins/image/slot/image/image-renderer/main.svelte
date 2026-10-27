<script lang="ts">
  import type { ImageProps } from '../../../../../base';

  import { normalizePublicUrl } from '../../../../../base';

  let { Raw: _Raw, class: className, current: _current, parents: _parents, render: _render, alt = '', src, ...props }: ImageProps = $props();

  const safeSrc = $derived(normalizePublicUrl(src));
</script>

<img {...props} class={['fluxdown-svelte-image-root', className]} {alt} src={safeSrc} />

<style lang="scss">
  @use './index.scss';
</style>
