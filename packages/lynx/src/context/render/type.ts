import type { GetPropsFunction } from '@fluxdown/lynx-plugins/typings';

export interface RenderConfig {
  getProps?: GetPropsFunction | null;
}
