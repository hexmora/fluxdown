import type { CompilerConfig, IPluggable, PluginSet } from '@fluxdown/types';

import type { IRenderPlugin } from '../../../../externals';

export type RenderPluggablesInputs<E, P, R, C = {}> = {
  config: CompilerConfig;

  extras: PluginSet<IPluggable<IRenderPlugin<E, P, R, C>, unknown>, RenderConfigs>;
};
