<script lang="ts">
  import type { TexKatexRendererProps } from './type';

  import { TexRenderer } from '../../../../tex/slot/tex/tex-renderer';

  let { Fallback = TexRenderer, ...props }: TexKatexRendererProps = $props();

  let renderFormula = $state.raw<((tex: string, mode: 'display' | 'inline') => string | null) | null>(null);

  const mode = $derived(props.mode ?? 'inline');

  const html = $derived(renderFormula?.(props.tex, mode) ?? null);

  $effect(() => {
    let active = true;

    void import('./utils').then(({ katexTexToHtml }) => {
      if (active) {
        renderFormula = katexTexToHtml;
      }
    }).catch(() => {});

    void import('katex/dist/katex.min.css').catch(() => {});

    return () => {
      active = false;
    };
  });
</script>

{#if html !== null}
  <svelte:element this={mode === 'display' ? 'div' : 'span'} class={['fluxdown-svelte-tex-katex-root', props.class]} data-mode={mode} data-tex={props.tex} style={props.style}>{@html html}</svelte:element>
{:else if renderFormula}
  <Fallback {...props} />
{:else}
  <TexRenderer {...props} />
{/if}

<style lang="scss">
  @use './index.scss';
</style>
