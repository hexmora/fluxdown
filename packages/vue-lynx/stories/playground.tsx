import { Fluxdown } from '@fluxdown/vue-lynx';
import { FluxdownLite } from '@fluxdown/vue-lynx/lite';
import { computed, defineComponent, ref, shallowRef, watch } from 'vue';
import { createApp, useGlobalEvent } from 'vue-lynx';

import type { PlaygroundArgs } from './consts';

import { STORY_MARKDOWN } from './consts';
import './playground.scss';

const Playground = defineComponent(() => {
  const runtime = lynx as typeof lynx & {
    __initData?: Partial<PlaygroundArgs>;

    getApp?: () => {
      _params?: { initData?: Partial<PlaygroundArgs>; updateData?: Partial<PlaygroundArgs> };
    };
  };

  const params = runtime.getApp?.()._params;

  const initial = runtime.__initData ?? { ...params?.initData, ...params?.updateData };

  const args = shallowRef<Partial<PlaygroundArgs>>(initial ?? {});

  const update = (value: unknown) => {
    if (value && typeof value === 'object') {
      args.value = { ...args.value, ...value };
    }
  };

  useGlobalEvent('fluxdown:update', update);

  const text = computed(() => args.value.text ?? STORY_MARKDOWN);

  const length = ref(0);

  const running = ref(true);

  watch(
    () => [text.value, args.value.streaming],
    () => {
      length.value = 0;

      running.value = true;
    },
  );

  watch(
    () => [args.value.streaming, running.value, length.value, text.value],
    (_, __, onCleanup) => {
      if (!args.value.streaming || !running.value || length.value >= text.value.length) {
        return;
      }

      const timer = setTimeout(() => {
        length.value = Math.min(length.value + 12, text.value.length);
      }, 32);

      onCleanup(() => clearTimeout(timer));
    },
    { immediate: true },
  );

  return () => {
    const Renderer = args.value.pack === 'lite' ? FluxdownLite : Fluxdown;

    const source = args.value.streaming ? text.value.slice(0, length.value) : text.value;

    return (
      <view class="playground">
        <view class="playground-toolbar">
          <text class="playground-title">Fluxdown · Vue Lynx</text>
          <text>
            {source.length} / {text.value.length} characters
          </text>
          {args.value.streaming && (
            <view
              class="playground-button"
              bindtap={() => {
                running.value = !running.value;
              }}
            >
              <text>{running.value ? 'Pause' : 'Continue'}</text>
            </view>
          )}
          <view
            class="playground-button"
            bindtap={() => {
              length.value = 0;

              running.value = true;
            }}
          >
            <text>Replay</text>
          </view>
        </view>
        <scroll-view class="playground-scroll" scroll-y>
          <view
            class="playground-content"
            style={{ backgroundColor: args.value.theme === 'dark' ? '#09090b' : '#ffffff' }}
          >
            <Renderer
              text={source}
              theme={args.value.theme}
              streaming={
                args.value.streaming && length.value < text.value.length
                  ? {
                      smooth: args.value.effect === 'chunk' ? false : (args.value.smooth ?? true),
                      effect: args.value.effect === 'none' ? false : (args.value.effect ?? 'scale'),
                    }
                  : false
              }
            />
          </view>
        </scroll-view>
      </view>
    );
  };
});

const app = createApp(Playground);

const runtime = (
  lynx as typeof lynx & { getApp: () => { callDestroyLifetimeFun: () => void } }
).getApp();

runtime.callDestroyLifetimeFun = () => app.unmount();

app.mount();
