<script lang="ts">
  import { PRESET_FULL_PLUGINS } from '@fluxdown/svelte-plugins/full';
  import { castArray } from 'lodash-es';

  import type { FluxdownProps } from '../type';

  import { EL } from '../../../consts';
  import { FluxdownRaw } from '../../raw';

  let { plugins = EL, ...props }: FluxdownProps = $props();

  // oxlint-disable-next-line no-unassigned-vars -- Assigned by bind:this after mounting.
  let renderer: FluxdownRaw;

  const merged = $derived([...PRESET_FULL_PLUGINS, ...castArray(plugins)]);

  export function getCore() {
    return renderer.getCore();
  }
</script>

<FluxdownRaw bind:this={renderer} {...props} plugins={merged} />
