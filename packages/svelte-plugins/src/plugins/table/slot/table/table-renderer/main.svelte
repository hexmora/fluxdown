<script lang="ts">
  import type { TableProps } from '../../../../../base';

  let { Raw: _Raw, class: className, children, ...props }: TableProps = $props();
</script>

<div {...props} class={['fluxdown-svelte-table-root', className]}>
  <table>{@render children?.()}</table>
</div>

<style lang="scss">
  @use './index.scss';
</style>
