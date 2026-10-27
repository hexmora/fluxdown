<script lang="ts">
  import type { TexProps } from '../../../../../../../base';

  let { class: className, mode = 'inline', style, tex }: TexProps = $props();

  let renderFormula = $state.raw<((tex: string, mode: 'display' | 'inline') => string | null) | null>(null);

  const html = $derived(renderFormula?.(tex, mode) ?? null);

  $effect(() => {
    let active = true;

    void import('./utils').then(({ texToSvg }) => {
      if (active) {
        renderFormula = texToSvg;
      }
    }).catch(() => {});

    return () => {
      active = false;
    };
  });
</script>

<svelte:element this={mode === 'display' ? 'div' : 'span'} aria-label={html === null ? undefined : tex} class={['fluxdown-svelte-tex-mathjax-katex-root', className]} data-formula-error={html === null || undefined} data-mode={mode} data-tex={tex} role={html === null ? undefined : 'math'} {style}>{#if html === null}{tex}{:else}{@html html}{/if}</svelte:element>

<style lang="scss">
  @use './index.scss';
</style>
