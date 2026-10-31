<script lang="ts">
  import type { CodeBlockProps } from '../../../../../base';

  import { NodeRenderer, SlotRenderer } from '../../../../../base';
  import { DIAGRAM_OPTIONS } from './consts';

  let { Raw, ...props }: CodeBlockProps = $props();

  const idPrefix = $props.id();

  let diagram = $state<string | null>(null);

  const supported = $derived(['mermaid', 'mindmap'].includes(props.language?.toLowerCase() ?? ''));

  $effect(() => {
    let active = true;

    const code = props.code;

    if (!supported || !code.trim()) {
      diagram = null;

      return;
    }

    void import('pele/lazy').then(({ renderAsync }) => renderAsync(code, { ...DIAGRAM_OPTIONS, idPrefix })).then(({ svg }) => {
      if (active) {
        diagram = svg;
      }
    }).catch(() => {
      // Keep the last valid diagram while streamed syntax is incomplete.
    });

    return () => {
      active = false;
    };
  });
</script>

{#if supported && diagram}
  <div class={['fluxdown-svelte-code-pele-root', props.class]} style={props.style} aria-busy={props.loading || undefined}>
    {#if props.showHeader !== false}
      <SlotRenderer type="CodeHeader" props={{ code: props.code, language: props.language, meta: props.meta, onCopy: props.onCopy }} />
    {/if}

    <figure class="fluxdown-svelte-code-pele-canvas" aria-label={props.meta || 'Diagram'}>{@html diagram}</figure>

    <NodeRenderer node={props.suffix} />
  </div>
{:else}
  {@render Raw?.(props)}
{/if}

<style lang="scss">
  @use './index.scss';
</style>
