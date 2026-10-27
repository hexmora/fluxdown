<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';
  import { PRESET_LITE_PLUGINS } from '@fluxdown/svelte-plugins/lite';
  import { FluxdownLite } from '@fluxdown/svelte/lite';
  import { FluxdownRaw } from '@fluxdown/svelte/raw';

  import type { PlaygroundProps } from './type';

  let {
    text,
    streaming = false,
    pack = 'full',
    effect: selectedEffect = 'scale',
    smooth = true,
    theme = 'light',
  }: PlaygroundProps = $props();

  let length = $state(0);

  let running = $state(true);

  const source = $derived(streaming ? text.slice(0, length) : text);

  const pending = $derived(streaming && length < text.length);

  const config = $derived(
    pending && {
      smooth: selectedEffect === 'chunk' ? false : smooth,
      effect: selectedEffect === 'none' ? false : selectedEffect,
    },
  );

  const Renderer = $derived(pack === 'lite' ? FluxdownLite : Fluxdown);

  $effect(() => {
    const target = text;

    length = 0;

    running = true;

    if (!streaming) return;

    const timer = setInterval(() => {
      if (!running) return;

      length = Math.min(length + 12, target.length);
    }, 32);

    return () => clearInterval(timer);
  });

  function replay() {
    length = 0;

    running = true;
  }
</script>

<main class="playground" data-theme={theme}>
  <header class="toolbar">
    <strong>Fluxdown · Svelte</strong>
    <span>{source.length} / {text.length} characters</span>
    {#if streaming}
      <button onclick={() => (running = !running)} type="button">
        {running ? 'Pause' : 'Continue'}
      </button>
      <button onclick={replay} type="button">Replay</button>
    {/if}
  </header>
  <section class="content" aria-label="Markdown preview">
    {#if pack === 'raw'}
      <FluxdownRaw
        build={{ tex: true, footnote: true }}
        plugins={PRESET_LITE_PLUGINS}
        streaming={config}
        text={source}
        {theme}
      />
    {:else}
      <Renderer build={{ tex: true, footnote: true }} streaming={config} text={source} {theme} />
    {/if}
  </section>
</main>

<style lang="scss">
  @use './index.scss';
</style>
