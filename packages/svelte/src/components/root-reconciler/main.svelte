<script lang="ts">
  import type { SvelteNode } from '@fluxdown/svelte-plugins/base';
  import type { IReactiveState } from 'stative';

  import { NodeRenderer } from '@fluxdown/svelte-plugins/base';

  import { fromState } from '../../utils/state';

  interface RootReconcilerProps {
    source: IReactiveState<SvelteNode[]>;
  }

  let { source }: RootReconcilerProps = $props();

  const nodes = $derived(fromState(source));
</script>

<NodeRenderer node={nodes.current} />
