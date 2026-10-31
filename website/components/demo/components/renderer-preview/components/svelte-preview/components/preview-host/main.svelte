<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  import type { PreviewHostProps } from './type';

  let { source }: PreviewHostProps = $props();
</script>

<Fluxdown {...$source} />
