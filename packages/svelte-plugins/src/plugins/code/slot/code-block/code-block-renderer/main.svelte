<script lang="ts">
  import type { CodeBlockProps } from '../../../../../base';

  import { SlotRenderer } from '../../../../../base';

  let {
    Raw: _Raw,
    class: className,
    code,
    language,
    loading,
    meta,
    onCopy,
    showHeader = true,
    suffix,
    ...props
  }: CodeBlockProps = $props();
</script>

<div {...props} class={['fluxdown-svelte-code-block-root', className]} aria-busy={loading || undefined}>
  {#if showHeader}
    <SlotRenderer type="CodeHeader" props={{ code, language, meta, onCopy }} />
  {/if}

  <SlotRenderer type="CodeHighlighter" props={{ code, language, meta, suffix }} />
</div>

<style lang="scss">
  @use './index.scss';
</style>
