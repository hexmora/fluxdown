<script lang="ts">
  import type { SlotInputProps, SlotType } from '../../../slot/type';
  import type { RenderElement, SvelteNode } from '../../node';

  import { NodeRenderer } from '.';
  import { SlotRenderer } from '../../../slot/components/slot-renderer';
  import { VOID_TAG_NAMES } from './consts';

  interface NodeRendererProps {
    node: SvelteNode;
  }

  let { node }: NodeRendererProps = $props();
</script>

{#if Array.isArray(node)}
  {#each node as child, index (typeof child === 'object' && child && !Array.isArray(child) ? child.key ?? index : index)}
    <NodeRenderer node={child} />
  {/each}
{:else if node !== null && node !== undefined && typeof node === 'object'}
  {@const element = node as RenderElement}

  {#snippet children()}
    <NodeRenderer node={element.children} />
  {/snippet}

  {#if typeof element.Component === 'string'}
    {#if VOID_TAG_NAMES.includes(element.Component)}
      <svelte:element this={element.Component} {...element.props} />
    {:else}
      <svelte:element this={element.Component} {...element.props}>
        {@render children()}
      </svelte:element>
    {/if}
  {:else if typeof element.Component === 'object'}
    <SlotRenderer type={element.Component.slot as SlotType} props={element.props as SlotInputProps} {children} />
  {:else}
    {@const Component = element.Component}

    <Component {...element.props} {children} />
  {/if}
{:else if typeof node === 'string' || typeof node === 'number'}
  {node}
{/if}
