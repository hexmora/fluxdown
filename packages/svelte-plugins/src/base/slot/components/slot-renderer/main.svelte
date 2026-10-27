<script lang="ts">
  import type { Snippet } from 'svelte';

  import { untrack } from 'svelte';

  import type { SlotInputProps, SlotType } from '../../type';

  import { useSlots } from '../../context';
  import { SlotComposer } from '../slot-composer';

  interface SlotRendererProps {
    type: SlotType;

    props: SlotInputProps;

    children?: Snippet;
  }

  let { type, props, children }: SlotRendererProps = $props();

  const useCurrentSlots = useSlots();

  const slots = $derived(useCurrentSlots());

  const plugins = $derived(slots[type] ?? []);

  const wrappers = $derived(slots.Wrapper ?? []);

  const fallbacks = $derived(slots.Fallback ?? []);

  let failedInputs: readonly unknown[] | undefined;

  let resetBoundary: (() => void) | undefined;

  const handleError = (_error: unknown, reset: () => void) => {
    failedInputs = [props, children, plugins, wrappers, fallbacks];

    resetBoundary = reset;
  };

  $effect(() => {
    const inputs = [props, children, plugins, wrappers, fallbacks];

    if (!resetBoundary || !failedInputs?.some((value, index) => value !== inputs[index])) {
      return;
    }

    const reset = resetBoundary;

    resetBoundary = undefined;

    failedInputs = undefined;

    untrack(reset);
  });
</script>

{#snippet named()}
  <SlotComposer {plugins} props={props as unknown as Record<string, unknown>} {children} />
{/snippet}

{#if plugins.length}
  {#if type === 'Fallback' || type === 'Wrapper'}
    {@render named()}
  {:else}
    <svelte:boundary onerror={handleError}>
      {#if wrappers.length}
        <SlotComposer plugins={wrappers} props={{ props, type }} children={named} />
      {:else}
        {@render named()}
      {/if}

      {#snippet failed(error, reset)}
        <SlotComposer plugins={fallbacks} props={{ props, type, error, onReset: reset }} />
      {/snippet}
    </svelte:boundary>
  {/if}
{/if}
