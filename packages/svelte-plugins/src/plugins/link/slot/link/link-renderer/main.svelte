<script lang="ts">
  import type { LinkProps } from '../../../../../base';

  import { normalizePublicUrl } from '../../../../../base';

  let { Raw: _Raw, class: className, current: _current, parents: _parents, render: _render, children, href, ...props }: LinkProps = $props();

  const safeHref = $derived(normalizePublicUrl(href, { allowHash: true, allowMailto: true }));
</script>

<a {...props} class={['fluxdown-svelte-link-root', className]} href={safeHref}>{@render children?.()}</a>

<style lang="scss">
  @use './index.scss';
</style>
