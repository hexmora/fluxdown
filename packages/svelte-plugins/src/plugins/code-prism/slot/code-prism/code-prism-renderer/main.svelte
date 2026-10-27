<script lang="ts">
  import type { CodeHighlighterProps, SvelteNode } from '../../../../../base';

  import { NodeRenderer } from '../../../../../base';
  import { CodeHighlighterRenderer } from '../../../../code/slot/code-highlighter/code-highlighter-renderer';

  let props: CodeHighlighterProps = $props();

  let highlighted = $state.raw<{ code: string; language: string; tokens: SvelteNode } | null>(null);

  const language = $derived(props.language ?? 'plaintext');

  const tokens = $derived(highlighted?.code === props.code && highlighted.language === language ? highlighted.tokens : null);

  $effect(() => {
    const controller = new AbortController();

    const code = props.code;

    const currentLanguage = language;

    void import('./utils').then(async ({ highlightCode }) => {
      const result = await highlightCode(code, currentLanguage, controller.signal);

      if (!controller.signal.aborted && result !== null) {
        highlighted = { code, language: currentLanguage, tokens: result };
      }
    }).catch(() => {});

    return () => controller.abort();
  });
</script>

<CodeHighlighterRenderer {...props} class={['fluxdown-svelte-code-prism-root', props.class]}><NodeRenderer node={tokens ?? props.code} /></CodeHighlighterRenderer>

<style lang="scss">
  @use './index.scss';
</style>
