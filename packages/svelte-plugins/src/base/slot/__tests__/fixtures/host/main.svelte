<script lang="ts">
  import type { AnySlotPluggable, SvelteNode } from '../../../..';

  import { NodeRenderer, SlotProvider } from '../../../..';

  interface HostProps {
    plugins: AnySlotPluggable[];

    node: SvelteNode;
  }

  let { plugins, node }: HostProps = $props();
</script>

<SlotProvider {plugins}><NodeRenderer {node} /></SlotProvider>
