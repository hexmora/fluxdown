<script lang="ts">
  import { NodeRenderer } from '@fluxdown/svelte-plugins/base';
  import { toState } from 'stative';

  import type { BlockReconcilerProps } from './type';

  import { useRender } from '../../context/render';
  import { fromState } from '../../utils/state';
  import { renderParentChildren } from './utils';

  let { block, patches, plugins }: BlockReconcilerProps = $props();

  const config = useRender();

  const source = $derived(block.value);

  const root = $derived(fromState(source));

  const patchState = $derived(toState(patches));

  const pluginSource = $derived(toState(plugins));

  const renderPlugins = $derived(fromState(pluginSource));

  const node = $derived(renderParentChildren(root.current, [root.current], patchState, renderPlugins.current, config.getProps));
</script>

<NodeRenderer {node} />
