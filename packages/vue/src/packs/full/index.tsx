import { PRESET_FULL_PLUGINS } from '@fluxdown/vue-plugins/full';
import { defineComponent, shallowRef } from 'vue';

import type { FluxdownRef } from '../raw';
import type { FluxdownProps } from './type';

import { useMergePlugins } from '../../hooks';
import { FluxdownRaw } from '../raw';

export type {
  BaseBuildConfig,
  EffectItem,
  FluxdownRawProps,
  FluxdownRef,
  SmoothConfig,
  StreamingConfig,
} from '../raw';
export * from '../../types';
export * from './type';

export const Fluxdown = /*#__PURE__*/ defineComponent(
  (props: FluxdownProps, { attrs, expose }) => {
    const raw = shallowRef<FluxdownRef>();

    const plugins = useMergePlugins(PRESET_FULL_PLUGINS, () => props.plugins);

    expose({
      get value() {
        return raw.value?.value;
      },
      destroy() {
        raw.value?.destroy();
      },
    });

    return () => {
      return <FluxdownRaw {...props} {...attrs} plugins={plugins.value} ref={raw} />;
    };
  },
  {
    name: 'Fluxdown',
    props: ['text', 'build', 'streaming', 'patches', 'plugins', 'theme'],
    inheritAttrs: false,
  },
);
