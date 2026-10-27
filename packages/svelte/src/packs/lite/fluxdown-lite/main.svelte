<script lang="ts">
  import { PRESET_LITE_PLUGINS } from '@fluxdown/svelte-plugins/lite';
  import { castArray } from 'lodash-es';

  import type { FluxdownLiteProps } from '../type';

  import { EL } from '../../../consts';
  import { FluxdownRaw } from '../../raw';

  let { plugins = EL, ...props }: FluxdownLiteProps = $props();

  // oxlint-disable-next-line no-unassigned-vars -- Assigned by bind:this after mounting.
  let renderer: FluxdownRaw;

  const merged = $derived([...PRESET_LITE_PLUGINS, ...castArray(plugins)]);

  export function getCore() {
    return renderer.getCore();
  }
</script>

<FluxdownRaw bind:this={renderer} {...props} plugins={merged} />
