<script lang="ts">
  import type { Snippet } from 'svelte';

  import { isPluggablesEqual, PluginBuilder } from '@fluxdown/core';
  import { MutableState, render, S } from 'stative';
  import { onDestroy, untrack } from 'svelte';

  import type { AnySlotPluggable, AnySlotPlugin, Slots } from '../../type';

  import { provideSlots } from '../../context';

  interface SlotProviderProps {
    plugins: readonly AnySlotPluggable[];

    children?: Snippet;
  }

  let { plugins, children }: SlotProviderProps = $props();

  const source = untrack(() => new MutableState({ initial: [...plugins], distinctor: isPluggablesEqual }));

  const builder = render(S([PluginBuilder<AnySlotPlugin>, { plugins: source }]));

  let instances = $state.raw(builder.value.value);

  const subscription = builder.value.subscribe((value) => {
    instances = value;
  });

  const slots = $derived.by(() => {
    const result: Partial<Slots> = {};

    for (const instance of instances) {
      if (!instance.Component) {
        continue;
      }

      const items = result[instance.type] ?? [];

      result[instance.type] = [...items, instance] as never;
    }

    return result;
  });

  provideSlots(() => slots);

  $effect.pre(() => {
    source.next([...plugins]);
  });

  onDestroy(() => {
    subscription.unsubscribe();

    builder.destroy();

    source.destroy();
  });
</script>

{@render children?.()}
