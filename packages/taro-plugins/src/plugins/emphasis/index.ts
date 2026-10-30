import { EmphasisPlugin as _EmphasisPlugin } from '@fluxdown/react-base-plugins/plugins/emphasis';

import { pluginExtends } from '../../base';
import { EmphasisSlotPlugin } from './slot';

export * from './slot';

export const EmphasisPlugin = /*#__PURE__*/ pluginExtends(_EmphasisPlugin, {
  slots: [EmphasisSlotPlugin],
});
