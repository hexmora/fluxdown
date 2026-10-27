<script lang="ts">
  import type { TableCellProps } from '../../../../../base';

  let { Raw: _Raw, children, tagName, ...props }: TableCellProps = $props();
</script>

<svelte:element this={tagName as string} {...props}>{@render children?.()}</svelte:element>
