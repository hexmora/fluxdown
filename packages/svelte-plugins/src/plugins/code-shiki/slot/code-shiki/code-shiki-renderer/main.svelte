<script lang="ts">
  import type { ThemedToken } from 'shiki/core';

  import type { CodeHighlighterProps } from '../../../../../base';

  import { CodeHighlighterRenderer } from '../../../../code/slot/code-highlighter/code-highlighter-renderer';

  let props: CodeHighlighterProps = $props();

  let highlighted = $state.raw<{ code: string; language: string; tokens: ThemedToken[][] } | null>(null);

  const language = $derived(props.language ?? 'plaintext');

  const tokens = $derived(highlighted?.code === props.code && highlighted.language === language ? highlighted.tokens : null);

  $effect(() => {
    const controller = new AbortController();

    const code = props.code;

    const currentLanguage = language;

    void import('./utils').then(async ({ highlightCode }) => {
      const result = await highlightCode(code, currentLanguage, controller.signal);

      if (!controller.signal.aborted && result) {
        highlighted = { code, language: currentLanguage, tokens: result };
      }
    }).catch(() => {});

    return () => controller.abort();
  });
</script>

<CodeHighlighterRenderer {...props}>
  {#if tokens}{#each tokens as line, lineIndex}{#if lineIndex > 0}{'\n'}{/if}{#each line as token (token.offset)}<span style:color={token.color} style:font-style={(token.fontStyle ?? 0) & 1 ? 'italic' : undefined} style:font-weight={(token.fontStyle ?? 0) & 2 ? 'bold' : undefined} style:text-decoration={(token.fontStyle ?? 0) & 4 ? 'underline' : undefined}>{token.content}</span>{/each}{/each}{:else}{props.code}{/if}
</CodeHighlighterRenderer>
