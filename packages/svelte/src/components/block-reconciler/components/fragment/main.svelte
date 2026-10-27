<script lang="ts">
  import type { Snippet } from 'svelte';

  interface FragmentProps {
    children?: Snippet;
  }

  let { children }: FragmentProps = $props();
</script>

{@render children?.()}
