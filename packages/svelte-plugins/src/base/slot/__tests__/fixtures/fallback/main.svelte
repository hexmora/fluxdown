<script lang="ts">
  import type { FallbackProps } from '../../../..';

  let { error }: FallbackProps = $props();
</script>

<span data-fallback="true">{error instanceof Error ? error.message : 'Failed'}</span>
