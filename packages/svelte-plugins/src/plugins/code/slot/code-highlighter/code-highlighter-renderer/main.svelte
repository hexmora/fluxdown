<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { CodeHighlighterProps } from '../../../../../base';

  import { NodeRenderer } from '../../../../../base';

  type CodeHighlighterRendererProps = CodeHighlighterProps & { children?: Snippet };

  let {
    Raw: _Raw,
    children,
    class: className,
    code,
    language = 'plaintext',
    meta: _meta,
    suffix,
    ...props
  }: CodeHighlighterRendererProps = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<pre {...props} class={['fluxdown-svelte-code-highlighter-root', className]} tabindex="0"><code class={language ? `language-${language}` : undefined}>{#if children}{@render children()}{:else}{code}{/if}<NodeRenderer node={suffix} /></code></pre>

<style lang="scss">
  @use './index.scss';
</style>
