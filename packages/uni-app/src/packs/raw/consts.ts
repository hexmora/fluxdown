import type { PropType } from 'vue';

import type { FluxdownRawProps } from './type';

export const RAW_PROPS = {
  text: { type: String, required: true },
  build: Object as PropType<FluxdownRawProps['build']>,
  streaming: [Boolean, Object] as PropType<FluxdownRawProps['streaming']>,
  patches: Array as PropType<FluxdownRawProps['patches']>,
  plugins: { type: [Object, Array] as PropType<FluxdownRawProps['plugins']>, required: true },
  theme: [String, Object, Array] as PropType<FluxdownRawProps['theme']>,
} as const;

export const PRESET_PROPS = {
  ...RAW_PROPS,
  plugins: { ...RAW_PROPS.plugins, required: false },
} as const;
