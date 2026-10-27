<script lang="ts">
  import type { ElementProps } from '../../../../../base';

  import { isSafeTagName } from '../../../../../base';
  import { VOID_TAG_NAMES } from '../../../../../base/render/components/node-renderer/consts';

  let { Raw: _Raw, class: className, children, tagName, ...props }: ElementProps = $props();
</script>

{#if isSafeTagName(tagName)}
  {#if VOID_TAG_NAMES.includes(tagName)}
    <svelte:element this={tagName} {...props} class={className} />
  {:else}
    <svelte:element this={tagName} {...props} class={className}>{@render children?.()}</svelte:element>
  {/if}
{/if}
