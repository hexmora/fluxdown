<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { CodeHeaderProps, SvelteNode } from '../../../../../base';

  import { CodeHeaderInnerActionKey, createElement, NodeRenderer } from '../../../../../base';
  import { CopyButton } from './components/copy-button';

  let {
    Raw: _Raw,
    actions,
    class: className,
    code,
    language,
    left,
    meta,
    onCopy,
    ...props
  }: CodeHeaderProps = $props();

  let isCopied = $state(false);

  let isCopying = $state(false);

  let timer: ReturnType<typeof setTimeout> | undefined;

  const copy = async () => {
    if (isCopying || !globalThis.navigator?.clipboard) {
      return;
    }

    isCopying = true;

    try {
      await navigator.clipboard.writeText(code);

      isCopied = true;

      clearTimeout(timer);

      timer = setTimeout(() => {
        isCopied = false;
      }, 2000);

      onCopy?.({ code, language, meta });
    } catch {
      isCopied = false;
    } finally {
      isCopying = false;
    }
  };

  const copyAction = $derived({
    key: CodeHeaderInnerActionKey.Copy,
    target: createElement(CopyButton, {
      copied: isCopied,
      copying: isCopying,
      onclick: () => void copy(),
    }),
  });

  const resolvedActions = $derived(typeof actions === 'function' ? actions([copyAction]) : [copyAction, ...(actions ?? [])]);

  onDestroy(() => clearTimeout(timer));
</script>

<div {...props} class={['fluxdown-svelte-code-header-root', className]}>
  <div class="fluxdown-svelte-code-header-language"><NodeRenderer node={left ?? language ?? 'text'} /></div>

  <div class="fluxdown-svelte-code-header-actions">
    {#each resolvedActions as action (action.key)}
      <NodeRenderer node={typeof action.target === 'function' ? createElement(action.target) : action.target as SvelteNode} />
    {/each}
  </div>
</div>

<style lang="scss">
  @use './index.scss';
</style>
