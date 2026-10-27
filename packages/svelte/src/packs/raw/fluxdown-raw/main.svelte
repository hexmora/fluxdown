<script lang="ts">
  import type { SvelteNode, SvelteRenderExtraParams } from '@fluxdown/svelte-plugins/base';

  import { Core, isPluggablesEqual, isPluginSetEqual } from '@fluxdown/core';
  import { getSvelteProps, SlotProvider } from '@fluxdown/svelte-plugins/base';
  import { shallowEqual } from 'shallow-equal';
  import { batch, D, MutableState, render, S } from 'stative';
  import { onDestroy, untrack } from 'svelte';

  import type { FluxdownRawProps } from '../type';

  import { RootReconciler } from '../../../components/root-reconciler';
  import { provideRender } from '../../../context/render';
  import { SvelteRenderer } from '../../../modules/svelte-renderer';
  import { toThemeStyles } from '../../../theme';
  import { toCoreConfig } from '../utils/core';
  import { isPatchesEqual } from '../utils/patches';

  let props: FluxdownRawProps = $props();

  const idPrefix = $props.id();

  const config = $derived(toCoreConfig(props, idPrefix));

  const initial = untrack(() => config);

  const text = new MutableState({ initial: initial.text });

  const build = new MutableState({ initial: initial.build, distinctor: shallowEqual });

  const patches = new MutableState({ initial: initial.patches, distinctor: isPatchesEqual });

  const remarks = new MutableState({ initial: initial.remarks, distinctor: isPluggablesEqual });

  const rehypes = new MutableState({ initial: initial.rehypes, distinctor: isPluggablesEqual });

  const repairs = new MutableState({ initial: initial.repairs, distinctor: isPluggablesEqual });

  const renders = new MutableState({ initial: initial.renders, distinctor: isPluggablesEqual });

  const mappers = new MutableState({ initial: initial.mappers, distinctor: isPluginSetEqual });

  const core = render(
    S([
      Core<SvelteNode, SvelteRenderExtraParams>,
      {
        Renderer: D(SvelteRenderer),
        text,
        build,
        patches,
        remarks,
        rehypes,
        repairs,
        renders,
        mappers,
      },
    ]),
  );

  provideRender({
    get getProps() {
      return props.getProps === undefined ? getSvelteProps : props.getProps;
    },
  });

  const style = $derived(`${toThemeStyles(props.theme)};${props.style ?? ''}`);

  $effect.pre(() => {
    batch(() => {
      build.next(config.build);

      patches.next(config.patches);

      remarks.next(config.remarks);

      rehypes.next(config.rehypes);

      repairs.next(config.repairs);

      renders.next(config.renders);

      mappers.next(config.mappers);

      text.next(config.text);
    });
  });

  onDestroy(() => {
    core.destroy();

    for (const source of [text, build, patches, remarks, rehypes, repairs, renders, mappers]) {
      source.destroy();
    }
  });

  export function getCore() {
    return core;
  }
</script>

<div class={['fluxdown-svelte-root', props.class]} {style}>
  <SlotProvider plugins={config.slots}>
    <RootReconciler source={core.value} />
  </SlotProvider>
</div>

<style lang="scss">
  @use '../../../styles/index.scss';
</style>
