<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { AnySlotPlugin } from '../../type';

  import { SlotComposer } from '.';

  interface SlotComposerProps {
    plugins: readonly AnySlotPlugin[];

    props: Record<string, unknown>;

    children?: Snippet;

    index?: number;
  }

  let { plugins, props, children, index = plugins.length - 1 }: SlotComposerProps = $props();

  const Component = $derived(plugins[index]?.Component);
</script>

{#snippet raw(previous: Record<string, unknown>)}
  <SlotComposer {plugins} props={previous} index={index - 1} children={'children' in previous ? previous.children as Snippet | undefined : children} />
{/snippet}

{#if Component}
  <Component {...props as any} Raw={index > 0 ? raw : null} {children} />
{/if}
