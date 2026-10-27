<script lang="ts">
  import type { IRenderPatchItem } from '@fluxdown/core';
  import type { Subscriber } from 'svelte/store';

  import type { SvelteNode } from '../../../../../../base';
  import type { PatchReconcilerProps } from './type';

  import { NodeRenderer } from '../../../../../../base';

  let { patchKey, patches, text }: PatchReconcilerProps = $props();

  const currentPatches = $derived.by(() => {
    const source = patches;

    return {
      subscribe(run: Subscriber<IRenderPatchItem<SvelteNode>[]>) {
        run(source.value);

        const subscription = source.subscribe(run);

        return () => subscription.unsubscribe();
      },
    };
  });

  const patch = $derived($currentPatches.find((item) => item.key === patchKey));
</script>

<NodeRenderer node={patch ? patch.render(text) : null} />
