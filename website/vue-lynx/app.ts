import type { FluxdownProps } from '@fluxdown/vue-lynx';

import { Fluxdown } from '@fluxdown/vue-lynx';
import { computed, createApp, defineComponent, h, shallowReactive, useGlobalEvent } from 'vue-lynx';

import type { LynxDemoData } from './type';

const Demo = defineComponent({
  setup() {
    const app = (
      lynx as typeof lynx & {
        getApp: () => {
          _params: { initData?: Partial<LynxDemoData>; updateData?: Partial<LynxDemoData> };
        };
      }
    ).getApp();

    const data = shallowReactive<LynxDemoData>({
      text: '',
      options: '{}',
      dark: false,
      cycle: 0,
      reducedMotion: false,
      scrollMode: 'static',
      ...app._params.initData,
      ...app._params.updateData,
    });

    const update = (value: unknown) => {
      if (value && typeof value === 'object') {
        Object.assign(data, value);
      }
    };

    const options = computed(
      () => JSON.parse(data.options) as Pick<FluxdownProps, 'build' | 'streaming'>,
    );

    const theme = computed<FluxdownProps['theme']>(() => [
      data.dark ? 'dark' : 'light',
      { tokens: { colors: { bg: 'transparent' } } },
    ]);

    useGlobalEvent('fluxdown:update', update);

    return () =>
      h(Fluxdown, {
        key: data.cycle,
        text: data.text,
        build: options.value.build,
        streaming: options.value.streaming,
        theme: theme.value,
      });
  },
});

const app = createApp(Demo);

const runtime = (
  lynx as typeof lynx & { getApp: () => { callDestroyLifetimeFun: () => void } }
).getApp();

runtime.callDestroyLifetimeFun = () => app.unmount();

app.mount();
